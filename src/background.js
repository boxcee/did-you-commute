const CLIENT_ID = '29389';
const CLIENT_SECRET = '';
const AUTH_KEY = 'oauth';
const ACTIVITIES_KEY = 'activities';

const get = (key) => {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
};

const set = (key, value) => {
  if (value !== undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const getURL = (url, params) => {
  const search = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
  return `${url}?${search}`;
};

const getHeaders = async () => {
  const oAuthToken = await getOAuthToken();
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${oAuthToken}`);
  return headers;
};

const getSettings = () => {
  const settings = get(AUTH_KEY);
  if (settings) {
    return new Map(Object.keys(settings).map(key => [key, settings[key]]));
  }
  throw new Error('Settings have not been saved');
};

const getToken = async (res) => {
  const search = new URLSearchParams(res);
  const code = search.get('code');

  const params = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code
  };

  const tokenURL = getURL('https://www.strava.com/oauth/token', params);

  const response = await fetch(tokenURL, { method: 'POST' });
  const json = await response.json();
  json.valid_until = Date.now() + (1000 * 60 * 60 * 6);
  set(AUTH_KEY, json);
  return json;
};

const getTokenByRefreshToken = async (refreshToken) => {
  const params = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  };

  const tokenURL = getURL('https://www.strava.com/oauth/token', params);
  const response = await fetch(tokenURL, { method: 'POST' });
  const json = await response.json();
  json.valid_until = Date.now() + (1000 * 60 * 60 * 6);
  set(AUTH_KEY, json);
  return json;
};

const launchWebAuthFlow = async () => {
  const redirectURL = browser.identity.getRedirectURL();
  const scopes = ['activity:read_all', 'activity:write', 'activity:read'];

  const params = {
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectURL,
    scope: scopes.join(',')
  };

  const authURL = getURL('https://www.strava.com/oauth/authorize', params);

  const response = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authURL
  });

  await getToken(response);
};

const getOAuthToken = async () => {
  const settings = getSettings();
  const validUntil = settings.get('valid_until');
  if (validUntil) {
    const now = Date.now();
    if (validUntil > now) {
      return settings.get('access_token');
    }

    const refreshToken = settings.get('refresh_token');
    const { access_token } = await getTokenByRefreshToken(refreshToken);
    return access_token;
  }
  throw new Error('No access token saved');
};

const getActivites = async () => {
  const oAuthToken = await getOAuthToken();
  if (oAuthToken) {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${oAuthToken}`);
    const request = new Request('https://www.strava.com/api/v3/athlete/activities', { headers });
    const response = await fetch(request);
    const json = await response.json();
    const message = {
      type: 'activities',
      body: json
    };
    browser.runtime.sendMessage(JSON.stringify(message));
    set(ACTIVITIES_KEY, json);
  }
};

const updateActivity = async (id) => {
  const headers = await getHeaders();
  const body = JSON.stringify({ commute: true });
  const request = new Request(`https://www.strava.com/api/v3/activities/${id}`, {
    headers,
    method: 'PUT',
    body
  });
  await fetch(request);
};

browser.runtime.onMessage.addListener(async (message) => {
  const { type, body } = JSON.parse(message);

  console.log('message', type, body, message);

  switch (type) {
    case 'commute':
      await updateActivity(body);
      break;
    case 'authorize':
      await launchWebAuthFlow();
      break;
    case 'list-activities':
      await getActivites();
      break;
    default:
      return;
  }
});

setInterval(getActivites, 60000);
