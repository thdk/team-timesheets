import * as React from 'react';

import * as firebase from 'firebase/app';
import * as firebaseui from 'firebaseui'
import store from '../store';
import { firestorable } from '../Firestorable/Firestorable';

export class Login extends React.Component {
    private readonly loginUi?: firebaseui.auth.AuthUI;
    private readonly loginUiConfig?: firebaseui.auth.Config;
    private isLoggedIn = false;
    constructor(props: any) {
        super(props);

        this.isLoggedIn = !!store.user.user;

        if (this.isLoggedIn) return;

        this.loginUiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: (authResult: firebase.auth.UserCredential, _redirectUrl: string) => {
                    store.user.setUser(authResult.user);
                    return false;
                }
            },
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
            // tosUrl and privacyPolicyUrl accept either url string or a callback
            // function.
            // Terms of service url/callback.
            tosUrl: 'http://thdk.be',
            // Privacy policy url/callback.
            privacyPolicyUrl: function () {
                window.location.assign('http://thdk.be');
            },
            signInFlow: 'popup',
            credentialHelper: firebaseui.auth.CredentialHelper.NONE
        };

        // Initialize the FirebaseUI Widget using Firebase.
        this.loginUi = new firebaseui.auth.AuthUI(firestorable.auth);
    }
    render() {
        return this.isLoggedIn ? <div>Already logged in</div> : (
            <div>
                <div id="firebaseui-auth-container"></div>
            </div>
        );
    }

    componentDidMount() {
        if (this.isLoggedIn || !this.loginUi || !this.loginUiConfig) return;
        // The start method will wait until the DOM is loaded.
        this.loginUi.start('#firebaseui-auth-container', this.loginUiConfig);
    }

    componentWillUnmount() {
        this.loginUi && this.loginUi.delete();
    }
}