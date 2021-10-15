import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import React, { useCallback } from 'react';

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
        alignItems: 'center',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          height: '30px',
        }}
      >
        Login

      </button>
    </div>
  );
};