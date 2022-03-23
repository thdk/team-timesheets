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
import '@material/top-app-bar/dist/mdc.top-app-bar.css';

import "./style/style.scss";

import { StoreProvider } from './contexts/store-context';
import { FirebaseProvider } from './contexts/firebase-context/firebase-context';
import { Router } from './containers/router';
import { ThemeProvider } from "@rmwc/theme";
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';

import { configure } from "mobx";
import { OauthProvider } from './oauth-providers';

import { RMWCProvider } from "@rmwc/provider";

configure({
    enforceActions: "never",
    computedRequiresReaction: false,
    reactionRequiresObservable: false,
    observableRequiresReaction: false,
    disableErrorBoundaries: false
})


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

            <ThemeProvider
                options={{
                    primary: '#009fdc',
                    secondary: '#ff9900',
                    error: '#b00020',
                    background: '#fff',
                    surface: '#fff',
                    onPrimary: 'rgba(255, 255, 255, 1)',
                    onSecondary: '#ffffff',
                    onSurface: 'rgba(0, 0, 0, 0.87)',
                    onError: '#fff',
                    textPrimaryOnBackground: 'rgba(0, 0, 0, 0.54)',
                    textSecondaryOnBackground: 'rgba(0, 0, 0, 0.54)',
                    textHintOnBackground: 'rgba(0, 0, 0, 0.38)',
                    textDisabledOnBackground: 'rgba(0, 0, 0, 0.38)',
                    textIconOnBackground: 'rgba(0, 0, 0, 0.38)',
                    textPrimaryOnLight: 'rgba(0, 0, 0, 0.87)',
                    textSecondaryOnLight: 'rgba(0, 0, 0, 0.54)',
                    textHintOnLight: 'rgba(0, 0, 0, 0.38)',
                    textDisabledOnLight: 'rgba(0, 0, 0, 0.38)',
                    textIconOnLight: 'rgba(0, 0, 0, 0.38)',
                    textPrimaryOnDark: 'white',
                    textSecondaryOnDark: 'rgba(255, 255, 255, 0.7)',
                    textHintOnDark: 'rgba(255, 255, 255, 0.5)',
                    textDisabledOnDark: 'rgba(255, 255, 255, 0.5)',
                    textIconOnDark: 'rgba(255, 255, 255, 0.5)'
                }}
            >
                <QueryClientProvider client={queryClient}>
                    <FirebaseProvider>
                        <OauthProvider>
                            <StoreProvider>
                                <Router />
                            </StoreProvider>
                        </OauthProvider>,
                    </FirebaseProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </RMWCProvider>
    </IntlProvider >,
    document.getElementById("root")
);
