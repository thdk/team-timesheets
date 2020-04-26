import * as React from 'react';
import { render } from 'react-dom';
import { startRouter, MobxRouter } from 'mobx-router-typescript';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { Store } from './stores/root-store';
import { routes } from './routes';

import '@rmwc/select/styles';
import { StoreProvider } from './contexts/store-context';

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
    <StoreProvider value={store}>
        <MobxRouter store={store} />
    </StoreProvider>
    , document.getElementById("root")
);
