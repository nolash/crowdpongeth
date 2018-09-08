import React from 'react';
import 'jquery';
import 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { hot } from "react-hot-loader";
import Home from "./Home";

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  </BrowserRouter>

);

export default hot(module)(Routes);
