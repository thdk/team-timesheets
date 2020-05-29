import * as React from 'react';
import { render } from 'react-dom';

import '@rmwc/select/styles';

import { StoreProvider } from './contexts/store-context';
import { FirebaseProvider } from './contexts/firebase-context/firebase-context';
import { Router } from './containers/router';

render(
    <FirebaseProvider>
        <StoreProvider>
            <Router/>
        </StoreProvider>
    </FirebaseProvider>,
    document.getElementById("root")
);
