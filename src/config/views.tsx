import * as React from 'react';

//models
import { Route, RoutesConfig } from 'mobx-router';

//components
import { Timesheets } from '../components/Timesheets';
import { Registration } from '../components/Registration';
import { App } from '../components/App';
import store, { IAppStore } from '../store';
import moment from 'moment-es6';
import { isObservable, transaction } from 'mobx';

const onEnter = (route: any) => {
  if (store) store.view.title = route.title;
};

const routes: RoutesConfig = {
  root: new Route( {
    path: '/',
    component: <App></App>,
    onEnter: (route: any, params: any, store: IAppStore) => {
      store.router.goTo(routes.home, { year: 2018, month: 12, day: 10}, store);
      onEnter(route);
    },
    title: "Root"
  }),
  home: new Route({
    path: '/day/:year/:month/:day',
    component: <App><Timesheets /></App>,
    onEnter: (route: any, params: any, store: IAppStore, queryParams: any) => {
      console.log(params);
      // store.registrations.query = ref => ref.where()
      transaction(() => {
        store.view.year = params.year;
        store.view.month = params.month;
        store.view.day = params.day;
      });
      store.registrations.getDocs();
      onEnter(route);
    },
    onParamsChange: (route: any, params: any, store: any) => {
      // store.registrations.query = ref => ref.where()
      transaction(() => {
        store.view.year = params.year;
        store.view.month = params.month;
        store.view.day = params.day;
      });
      store.registrations.getDocs();
    },
    title: "Overview"
  }),
  new: new Route({
    path: '/registration',
    component: <App><Registration /></App>,
    onEnter,
    title: "New registration"
  })
};
export default routes;