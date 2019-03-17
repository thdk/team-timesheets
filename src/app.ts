import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { MobxRouter, startRouter } from 'mobx-router';

import routes from './routes/index';
import store from './stores/RootStore';


startRouter(routes, store);

(window as any)["routes"] = routes;

render(
    React.createElement(
        Provider,
        { store },
        React.createElement(MobxRouter)
    ), document.getElementById("root")
);