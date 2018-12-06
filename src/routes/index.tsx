import * as React from 'react';
import { App } from '../internal';
import { Route, RoutesConfig } from 'mobx-router';
import timesheetsRoutes from './timesheets/index';
import configRoutes from './config';
import { goTo as goToOverview } from '../internal';
import store from '../store';

const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: () => {
      goToOverview(store); // TODO: verify if we can't use the global store inside goToOverview
    },
    title: "Root"
  }),
  ...timesheetsRoutes,
  ...configRoutes
};
export default routes;