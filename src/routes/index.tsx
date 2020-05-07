import * as React from 'react';
import { Route } from 'mobx-router';

import { App, goToOverview } from '../internal';
import timesheetsRoutes from './registrations';
import settingsRoutes from './settings';
import reportRoutes from './reports';
import userRoutes from './users';
import projectRoutes from './projects';
import dashboardRoures from './dashboard';
import loginRoutes from './login';
import favoriteRoutes from './favorites';
import { IRootStore } from '../stores/root-store';

const root = {
  root: new Route<IRootStore>({
    path: '/',
    component: <App></App>,
    onEnter: (_route: Route<IRootStore>, _params: {}, s: IRootStore) => {
      goToOverview(s);
    },
    title: "Root"
  })
};

export const routes = {
  ...root,
  ...loginRoutes,
  ...timesheetsRoutes,
  ...settingsRoutes,
  ...reportRoutes,
  ...userRoutes,
  ...projectRoutes,
  ...dashboardRoures,
  ...favoriteRoutes,
};
