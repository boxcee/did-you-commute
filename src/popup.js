const AUTH_KEY = 'oauth';
const ACTIVITIES_KEY = 'activities';

const addActivities = (body) => {
  const container = document.getElementById('container');
  let content = document.getElementById('content');
  content.parentNode.removeChild(content);
  content = document.createElement('div');
  content.className = 'content';
  content.id = 'content';
  container.appendChild(content);

  body
    .filter(({ type }) => type === 'Ride')
    .slice(0, 3)
    .forEach(({ id, name, distance, commute }) => {
      const item = document.createElement('div');
      item.className = 'content-item';

      const nameElement = document.createElement('div');
      nameElement.innerText = name;
      nameElement.className = 'content-name';
      item.appendChild(nameElement);

      const distanceElement = document.createElement('div');
      formattedDistance = (Number(distance) / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 });
      distanceElement.innerText = `${formattedDistance} km`;
      distanceElement.className = 'content-distance';
      item.appendChild(distanceElement);

      const commuteElement = document.createElement('button');
      commuteElement.innerText = commute ? 'yes' : 'no';
      commuteElement.className = 'content-button';
      commuteElement.addEventListener('click', () => {
        const message = {
          type: 'commute',
          body: id
        };

        browser.runtime.sendMessage(JSON.stringify(message));
      });
      item.appendChild(commuteElement);

      content.appendChild(item);
    });
};

const authorize = () => {
  const message = {
    type: 'authorize'
  };

  browser.runtime.sendMessage(JSON.stringify(message));
};

browser.runtime.onMessage.addListener((message) => {
  const { type, body } = JSON.parse(message);
  if (type === 'activities') {
    addActivities(body);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const auth = document.getElementById('authorize');
  const authButton = document.getElementById('authorize-button');

  const authStorage = localStorage.getItem(AUTH_KEY);
  const activitiesStorage = localStorage.getItem(ACTIVITIES_KEY);

  if (!authStorage) {
    auth.style = 'display: block';
    authButton.addEventListener('click', authorize);
  }

  if (activitiesStorage) {
    const activities = JSON.parse(activitiesStorage);
    addActivities(activities);
  } else {
    addActivities([]);
  }
});
