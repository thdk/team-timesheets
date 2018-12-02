import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import {path as parentPath} from './overview';
import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute } from '../actions';

export const path = parentPath + "/detail";

export default {
    registrationDetail: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter: setTitleForRoute
    })
} as RoutesConfig;
