import * as React from 'react';
import { render } from 'react-dom';
import { startRouter, MobxRouter } from 'mobx-router';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { Store } from './stores/root-store';
import { routes } from './routes';
import { Provider } from 'mobx-react';

import '@rmwc/select/styles';

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

const store = (window as any)["store"] = new Store({
    auth,
    firestore,
    storage,
});

startRouter(routes, store);

(window as any)["routes"] = routes;
render(
    <Provider store={store}>
        <MobxRouter />
    </Provider>
    , document.getElementById("root")
);
