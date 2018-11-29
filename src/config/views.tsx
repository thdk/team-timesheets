import * as React from 'react';

//models
import {Route} from 'mobx-router';

//components
import { Timesheets } from '../components/Timesheets';
import {Registration} from '../components/Registration';
import { App } from '../components/App';
import { IAppStore } from '../store';

const onEnter = (route: any, params: any, store: IAppStore) => {
  console.log(`entering book with params`, params);
  store.view = {title: route.title};
};

const views = {
  home: new Route({
    path: '/',
    component: <App><Timesheets/></App>,
    onEnter,
    title: "Overview"
  }),
  new: new Route({
    path: '/registration',
    component: <App><Registration/></App>,
    onEnter,
    title: "New registration"
  })  
};
export default views;