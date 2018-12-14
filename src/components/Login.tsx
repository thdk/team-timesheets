import * as React from 'react';

import * as firebase from 'firebase/app';
import * as firebaseui from 'firebaseui'

export class Login extends React.Component {
    render() {
        return(
            <div>
                <div id="firebaseui-auth-container"></div>
            </div>
        );
    }

    componentDidMount() {
        const uiConfig = {
            callbacks: {

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
            privacyPolicyUrl: function() {
              window.location.assign('http://thdk.be');
            }
          };

          // Initialize the FirebaseUI Widget using Firebase.
          var ui = new firebaseui.auth.AuthUI(firebase.auth());
          // The start method will wait until the DOM is loaded.
          ui.start('#firebaseui-auth-container', uiConfig);
    }
}