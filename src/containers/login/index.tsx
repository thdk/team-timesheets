import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import React, { useCallback } from 'react';
import { GoogleLoginButton } from 'react-social-login-buttons';

export const Login = () => {
  const auth = getAuth();
  const onClick = useCallback(() => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(() => {
      // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // // The email of the user's account used.
      // const { email } = error;
      // // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
  }, [
    auth,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        paddingTop: '1em'
      }}
    >
      <GoogleLoginButton
        onClick={onClick}
        style={{
          width: '220px',
        }}
      />
    </div>
  );
};