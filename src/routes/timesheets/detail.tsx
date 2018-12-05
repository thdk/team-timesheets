import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import { path as parentPath } from './overview';
import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute } from '../actions';
import { IRootStore } from '../../store';
import { goTo as goToOverview } from '../../internal';
import { reaction } from '../../../node_modules/mobx';

export const path = parentPath + "/detail";

export default {
    registrationDetail: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter: (route: Route, _params: any, s: IRootStore) => {
            const action = {
                action: () => {
                    s.registrationsStore.save();
                    goToOverview(s, { day: s.view.day, year: s.view.year, month: s.view.month });
                },
                icon: "save",
                isActive: false
            };
            s.view.setActions([
                action
            ]);
            setTitleForRoute(route);

            const u = reaction(() => s.registrationsStore.registration, () => {
                // use icon as unique id of action
                s.view.actions.replace(s.view.actions.filter(a => a.icon !== action.icon));
                u();
            });
        }, beforeExit: (_route: Route, _params: any, s: IRootStore) => {
            s.registrationsStore.registration = {};
        }
    })
} as RoutesConfig;
