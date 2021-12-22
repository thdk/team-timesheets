import * as React from 'react';
import { Route } from 'mobx-router';

import { App, goToOverview } from '../internal';
import timesheetsRoutes from './registrations';
import settingsRoutes from './settings';
import reportRoutes from './reports';
import userRoutes from './users';
import * as projectRoutes from './projects';
import taskRoutes from './tasks';
import dashboardRoutes from './dashboard';
import loginRoutes from './login';
import favoriteRoutes from './favorites';
import divisionRoutes from './divisions';
import { IRootStore } from '../stores/root-store';

const root = {
  root: new Route<IRootStore, Record<any, never>>({
    path: '/',
    component: <App></App>,
    onEnter: (_route: Route<IRootStore, Record<any, never>>, _params: Record<any, never>, s: IRootStore) => {
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
  ...projectRoutes.projectDetailRoute,
  ...projectRoutes.projectListRoute,
  ...dashboardRoutes,
  ...favoriteRoutes,
  ...divisionRoutes,
  ...taskRoutes,
};
