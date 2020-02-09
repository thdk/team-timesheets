import * as React from 'react';

import * as firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';

import { auth } from '../../firebase/my-firebase';
import { LoginProvider } from '../../firebase/types';
import { withConfigValues } from '../configs/with-config-values';

type Props = { configs: { loginProviders: LoginProvider[] } };

class Login extends React.Component<Props> {
    private loginUi?: firebaseui.auth.AuthUI;
    render() {
        return (
            <div>
                <div id="firebaseui-auth-container"></div>
            </div>
        );
    }

    componentDidMount() {
        const { loginProviders } = this.props.configs;

        const loginUiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: (_authResult: firebase.auth.UserCredential, _redirectUrl: string) => {
                    return false;
                }
            },
            signInOptions: loginProviders.map(this.getFirebaseAuthProvider),
            // tosUrl and privacyPolicyUrl accept either url string or a callback
            // function.
            // Terms of service url/callback.
            // tosUrl,
            // Privacy policy url/callback.
            // privacyPolicyUrl,
            // privacyPolicyUrl: function () {
            //
            // },
            signInFlow: 'popup',
            credentialHelper: firebaseui.auth.CredentialHelper.NONE
        };

        // Initialize the FirebaseUI Widget using Firebase.
        this.loginUi = new firebaseui.auth.AuthUI(auth);
        // The start method will wait until the DOM is loaded.
        this.loginUi.start('#firebaseui-auth-container', loginUiConfig);
    }

    componentWillUnmount() {
        this.loginUi && this.loginUi.delete();
    }

    getFirebaseAuthProvider(provider: LoginProvider) {
        switch (provider) {
            case LoginProvider.Google:
                return firebase.auth.GoogleAuthProvider.PROVIDER_ID;
            case LoginProvider.Facebook:
                return firebase.auth.FacebookAuthProvider.PROVIDER_ID;
            case LoginProvider.Email:
                return firebase.auth.EmailAuthProvider.PROVIDER_ID;
            case LoginProvider.Guest:
                return firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID;
        }
    }
}

export default withConfigValues(Login, ["loginProviders"]);
