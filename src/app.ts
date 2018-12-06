import * as React from 'react';
import * as ReactDOM from 'react-dom'

import {Provider} from 'mobx-react';
import {MobxRouter, startRouter} from 'mobx-router';
import routes from './routes/index';
import store from './store';
import { reaction } from '../node_modules/mobx';

startRouter(routes, store);

(window as any)["routes"] = routes;

ReactDOM.render(
    React.createElement(
        Provider,
        {store},
        React.createElement(MobxRouter)
    ), document.getElementById("root")
);

const loadRegistrations = () => {
    const endDate = store.view.moment.clone().add(1, "days").toDate();
    const startDate = store.view.moment.clone().toDate();
    store.registrations.query = ref => ref.where("date", ">", startDate).where("date", "<=", endDate);
    store.registrations.getDocs();
};

loadRegistrations();
reaction(() => store.view.moment, loadRegistrations);