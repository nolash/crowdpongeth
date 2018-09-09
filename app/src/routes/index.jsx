import React from 'react';
import 'jquery';
import 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../index.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { hot } from "react-hot-loader";
import Game from "./Game";
import Games from "./Games";
import NewGame from "./NewGame";
import Swarm from "./Swarm";

const Routes = () => (
  <div>
    <div className="main-header">
      <h1>[[-- Crowd Pong --]]</h1>
    </div>
    <div className="main-content">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Games}/>
          <Route exact path="/new-game" component={NewGame}/>
          <Route exact path="/game/:gameIndex" component={Game}/>
          <Route path="/swarm" component={Swarm} />
        </Switch>
      </BrowserRouter>
    </div>
  </div>
);

export default hot(module)(Routes);
