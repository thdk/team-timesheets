import * as React from 'react';

import * as firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';

import { LoginProvider } from '../../firebase/types';
import { withConfigValues } from '../configs/with-config-values';
import { useFirebase } from '../../contexts/firebase-context/firebase-context';

const getFirebaseAuthProvider = (provider: LoginProvider) => {
    switch (provider) {
        case LoginProvider.Google:
            return {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                scopes: [
                    "email",
                ],
            };
        case LoginProvider.Facebook:
            return firebase.auth.FacebookAuthProvider.PROVIDER_ID;
        case LoginProvider.Email:
            return firebase.auth.EmailAuthProvider.PROVIDER_ID;
        case LoginProvider.Guest:
            return firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID;
    }
}

type Props = { configs: { loginProviders: LoginProvider[] } };

export const Login = ({ configs }: Props) => {

    const firebase = useFirebase();

    React.useEffect(() => {
        const { loginProviders } = configs;

        const loginUiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: (_authResult: firebase.auth.UserCredential, _redirectUrl: string) => {
                    // authResult.user?.getIdToken()
                    return false;
                }
            },
            signInOptions: loginProviders.map(getFirebaseAuthProvider),
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
        const loginUi = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        loginUi.start('#firebaseui-auth-container', loginUiConfig);

        return () => {
            loginUi.delete();
        };
    }, []);

    return (
        <div>
            <div id="firebaseui-auth-container"></div>
        </div>
    );
}

export default withConfigValues(Login, [
    {
        key: "loginProviders",
        defaultValue: [LoginProvider.Google],
    },
]);
