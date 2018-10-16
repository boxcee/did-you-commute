const authorize = () => {
  const redirectURL = browser.identity.getRedirectURL() + 'commute';
  const clientID = '29389';
  const scopes = ['activity:write', 'activity:read'];
  let authURL = 'https://www.strava.com/oauth/authorize';
  authURL += `?client_id=${clientID}`;
  authURL += `&response_type=code`;
  authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
  authURL += `&scope=${encodeURIComponent(scopes.join(','))}`;

  return browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authURL
  });
};

authorize();
