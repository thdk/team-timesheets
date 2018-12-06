import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { IRootStore } from '../../store';
import { transaction } from 'mobx';
import { setTitleForRoute } from '../actions';
import { App } from '../../internal';

interface IDate {
    year: number;
    month: number;
    day: number;
}

export const path = "/timesheets";

export const goTo = (s: IRootStore, date?: IDate) => {
    if (!date) {
        const toDay = new Date();
        date = {
            year: toDay.getFullYear(),
            month: toDay.getMonth() + 1,
            day: toDay.getDate()
        }
    }
    s.router.goTo(routes.overview, date, s);
}

const routeChanged = (route: any, params: IDate, s: IRootStore) => {
    transaction(() => {
        s.view.year = params.year;
        s.view.month = params.month;
        s.view.day = params.day;
    });

    const endDate = s.view.moment.clone().add(1, "days").toDate();
    const startDate = s.view.moment.clone().toDate();
    s.registrations.query = ref => ref.where("date", ">", startDate).where("date", "<=", endDate);
    s.registrations.getDocs();
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


