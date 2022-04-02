import * as React from 'react';
import { render } from 'react-dom';

import '@rmwc/theme/styles';
import '@rmwc/snackbar/styles';
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
import '@rmwc/data-table/styles';
import '@rmwc/icon/styles';
import '@rmwc/top-app-bar/styles';
import '@material/top-app-bar/dist/mdc.top-app-bar.css';

import "./style/style.scss";

import { StoreProvider } from './contexts/store-context';
import { FirebaseProvider } from './contexts/firebase-context/firebase-context';
import { Router } from './containers/router';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';

import { configure } from "mobx";
import { OauthProvider } from './oauth-providers';

import { RMWCProvider } from "@rmwc/provider";
import { ThemeProvider } from './components/theme-provider';

configure({
    enforceActions: "never",
    computedRequiresReaction: false,
    reactionRequiresObservable: false,
    observableRequiresReaction: false,
    disableErrorBoundaries: false
});

const queryClient = new QueryClient()

render(
    <IntlProvider
        locale={"en-US"}
        timeZone={"Europe/Brussels"}
    >
        <RMWCProvider
            typography={{
                body2: ({ children }: React.PropsWithChildren<unknown>) => (
                    <span>
                        <b>{children}!!!</b>
                    </span>
                )
            }}
        >
            <QueryClientProvider client={queryClient}>
                <FirebaseProvider>
                    <OauthProvider>
                        <StoreProvider>
                            <ThemeProvider>
                                <Router />
                            </ThemeProvider>
                        </StoreProvider>
                    </OauthProvider>
                </FirebaseProvider>
            </QueryClientProvider>
        </RMWCProvider>
    </IntlProvider >,
    document.getElementById("root")
);
