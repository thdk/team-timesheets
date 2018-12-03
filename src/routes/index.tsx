import * as React from 'react';
import { App } from '../internal';
import { Route, RoutesConfig } from 'mobx-router';
import timesheetsRoutes from './timesheets/index';
import { goTo as goToOverview } from '../internal';

const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: () => {
      goToOverview();
    },
    title: "Root"
  }),
  ...timesheetsRoutes
};
export default routes;