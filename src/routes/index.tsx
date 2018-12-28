import * as React from 'react';
import { App } from '../internal';
import { Route, RoutesConfig } from 'mobx-router';
import timesheetsRoutes from './timesheets/index';
import settingsRoutes from './settings';
import reportRoutes from './reports/index';
import { goToOverview } from '../internal';
import store from '../stores/RootStore';

const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: () => {
      goToOverview(store); // TODO: verify if we can't use the global store inside goToOverview
    },
    // beforeEnter,
    title: "Root"
  }),
  ...timesheetsRoutes,
  ...settingsRoutes,
  ...reportRoutes
};
export default routes;