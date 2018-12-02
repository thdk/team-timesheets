import { App } from '../../components/App';
import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import store, { IAppStore } from '../../store';
import { transaction } from 'mobx';
import { setTitleForRoute } from '../actions';

interface IDate {
    year: number;
    month: number;
    day: number;
}

export const path = "/timesheets";

// export const goTo = (date?: IDate) => {
//     if (!date) {
//         const toDay = new Date();
//         date = {
//             year: toDay.getFullYear(),
//             month: toDay.getMonth(),
//             day: toDay.getDate()
//         }
//     }
//     store.router.goTo(routes.overview, date, store)
// }

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: (route: any, params: IDate, store: IAppStore, querystringParams: any) => {
            // store.registrations.query = ref => ref.where()
            transaction(() => {
                store.view.year = params.year;
                store.view.month = params.month;
                store.view.day = params.day;
            });
            store.registrations.getDocs();
            setTitleForRoute(route);
        },
        onParamsChange: (_route: any, params: IDate, store: IAppStore) => {
            // store.registrations.query = ref => ref.where()
            transaction(() => {
                store.view.year = params.year;
                store.view.month = params.month;
                store.view.day = params.day;
            });
            store.registrations.getDocs();
        },
        title: "Overview"
    })
} as { overview: Route};

export default routes;


