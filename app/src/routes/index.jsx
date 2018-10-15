import React from 'react';
import 'jquery';
import 'popper.js';
 import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../index.css';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import { hot } from 'react-hot-loader';
import Game from './Game';
import Games from './Games';
import NewGame from './NewGame';
import PongCanvas from './PongCanvas';

const Routes = () => (
  <div>
    <div className="main-header">
      <a to="/">
        <h1>
[[-- Crowd Pong --]]
        </h1>
      </a>
    </div>
    <div className="main-content">
      <HashRouter>
        <Switch>
          <Route exact path="/" component={Games} />
          <Route exact path="/new-game" component={NewGame} />
          <Route exact path="/game/:gameIndex" component={Game} />
          <Route path="/pong" component={PongCanvas} />
        </Switch>
      </HashRouter>
    </div>
  </div>
);

export default hot(module)(Routes);
