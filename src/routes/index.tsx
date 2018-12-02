//components
import { App } from '../components/App';
import * as React from 'react';

//models
import { Route, RoutesConfig } from 'mobx-router';

// routes
import timesheetsRoutes from './timesheets/index';
// import { goTo as goToOverview } from './timesheets/overview';

const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: () => {
      // goToOverview();
    },
    title: "Root"
  }),
  ...timesheetsRoutes
};
export default routes;