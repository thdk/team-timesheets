import * as React from 'react';
import { render } from 'react-dom';
import { startRouter, MobxRouter } from 'mobx-router';

import { Store } from './stores/root-store';
import { routes } from './routes';
import { Provider } from 'mobx-react';

import '@rmwc/select/styles';

const store = (window as any)["store"] = new Store();

startRouter(routes, store);

(window as any)["routes"] = routes;
render(
    <Provider store={store}>
        <MobxRouter />
    </Provider>
    , document.getElementById("root")
);
