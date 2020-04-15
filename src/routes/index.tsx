import * as React from 'react';
import { App } from '../internal';
import { Route, RoutesConfig } from 'mobx-router';
import timesheetsRoutes from './registrations';
import settingsRoutes from './settings';
import reportRoutes from './reports';
import userRoutes from './users';
import projectRoutes from './projects';
import dashboardRoures from './dashboard';
import loginRoutes from './login';
import favoriteRoutes from './favorites';

import { goToOverview } from '../internal';
import { IRootStore } from '../stores/root-store';

export const routes: RoutesConfig = {
  root: new Route({
    path: '/',
    component: <App></App>,
    onEnter: (_route: Route, _params: { id?: string }, s: IRootStore) => {
      goToOverview(s); // TODO: verify if we can't use the global store inside goToOverview
    },
    // beforeEnter,
    title: "Root"
  }),
  ...loginRoutes,
  ...timesheetsRoutes,
  ...settingsRoutes,
  ...reportRoutes,
  ...userRoutes,
  ...projectRoutes,
  ...dashboardRoures,
  ...favoriteRoutes,
};
