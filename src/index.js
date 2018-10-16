import React, { Component } from 'react';
import { render } from 'react-dom';
import { Button } from '@material-ui/core';

const authorize = () => {
  const redirectURL = browser.identity.getRedirectURL();
  const clientID = '29389';
  const scopes = ['activity:read_all', 'activity:write'];
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


class Popup extends Component {
  handleClick = () => {
    authorize().then(console.log).catch(console.log);
  };

  render() {
    return (
      <div>
        Hello Strava!
        <Button variant="raised" onClick={this.handleClick}>Hello Popup</Button>
      </div>
    );
  }
}

render(<Popup />, document.getElementById('popup'));
