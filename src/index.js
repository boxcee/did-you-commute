import React, { Component } from 'react';
import { render } from 'react-dom';
import { Button } from '@material-ui/core';

class Popup extends Component {
  render() {
    return (
      <div>
        Hello Strava!
        <Button>Hello Popup</Button>
      </div>
    );
  }
}

render(<Popup />, document.getElementById('popup'));
