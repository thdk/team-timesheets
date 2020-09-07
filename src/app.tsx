import * as React from 'react';
import { render } from 'react-dom';

import '@rmwc/theme/styles';
import '@rmwc/typography/styles';
import '@rmwc/button/styles';
import '@rmwc/tabs/styles';
import '@rmwc/checkbox/styles';
import '@rmwc/fab/styles';
import '@rmwc/select/styles';
import '@rmwc/chip/styles';
import '@rmwc/drawer/styles';
import '@rmwc/menu/styles';
import '@rmwc/list/styles';
import '@rmwc/icon-button/styles';
import '@rmwc/textfield/styles';
import '@rmwc/dialog/styles';
import '@rmwc/switch/styles';
import '@material/top-app-bar/dist/mdc.top-app-bar.css';

import "./style/style.scss";

import { StoreProvider } from './contexts/store-context';
import { FirebaseProvider } from './contexts/firebase-context/firebase-context';
import { Router } from './containers/router';
import { ThemeProvider } from "@rmwc/theme";
import { IntlProvider } from 'react-intl';

render(
    <IntlProvider
        locale={"en-US"}
    >
        <ThemeProvider
            options={{
                primary: '#009fdc',
                secondary: '#ff9900',
                onSecondary: '#ffffff'
            }}
        >
            <FirebaseProvider>
                <StoreProvider>
                    <Router />
                </StoreProvider>
            </FirebaseProvider>
        </ThemeProvider>
    </IntlProvider>,
    document.getElementById("root")
);
