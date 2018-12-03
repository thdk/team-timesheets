import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import { path as parentPath } from './overview';
import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute } from '../actions';
import store from '../../store';
import { goTo as goToOverview } from '../../internal';

export const path = parentPath + "/detail";

export default {
    registrationDetail: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter: (route: Route, _params: any) => {
            store.view.setActions([
                {
                    action: () => {
                        store.registrationsStore.save();
                        goToOverview({ day: store.view.day, year: store.view.year, month: store.view.month });
                    },
                    icon: "save",
                    isActive: false
                }
            ]);
            setTitleForRoute(route);
        }
    })
} as RoutesConfig;
