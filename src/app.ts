import * as React from 'react';
import * as ReactDOM from 'react-dom'

import {Provider} from 'mobx-react';
import {MobxRouter, startRouter} from 'mobx-router';
import routes from './routes/index';
import store from './store';

startRouter(routes, store);

(window as any)["routes"] = routes;

ReactDOM.render(
    React.createElement(
        Provider,
        {store},
        React.createElement(MobxRouter)
    ), document.getElementById("root")
);