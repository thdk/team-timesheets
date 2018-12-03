import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import store, { IRootStore } from '../../store';
import { transaction } from 'mobx';
import { setTitleForRoute } from '../actions';
import { App } from '../../internal';

interface IDate {
    year: number;
    month: number;
    day: number;
}

export const path = "/timesheets";

export const goTo = (date?: IDate) => {
    if (!date) {
        const toDay = new Date();
        date = {
            year: toDay.getFullYear(),
            month: toDay.getMonth() + 1,
            day: toDay.getDate()
        }
    }
    store.router.goTo(routes.overview, date, store)
}

const routeChanged = (route: any, params: IDate, store: IRootStore) => {
    // store.registrations.query = ref => ref.where()
    transaction(() => {
        store.view.year = params.year;
        store.view.month = params.month;
        store.view.day = params.day;
    });

    const endDate = store.view.moment.clone().add(1, "days").toDate();
    const startDate = store.view.moment.clone().toDate();
    store.registrations.query = ref => ref.where("date", ">", startDate).where("date", "<=", endDate);
    store.registrations.getDocs();
    setTitleForRoute(route);
}

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: routeChanged,
        onParamsChange: routeChanged,
        title: "Overview"
    })
} as { overview: Route };

export default routes;


