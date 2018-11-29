import * as React from 'react';

//models
import {Route} from 'mobx-router';

//components
import { Timesheets } from '../components/Timesheets';
import {Registration} from '../components/Registration';

const views = {
  home: new Route({
    path: '/',
    component: <Timesheets/>
  }),
  new: new Route({
    path: '/registration',
    component: <Registration/>
  })  
};
export default views;