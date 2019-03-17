import "firebase/auth";

/**
 * Resolves with firbase.User if user is logged in
 * Rejects if no user is logged in
 */
export const getLoggedInUserAsync = (auth: firebase.auth.Auth) => {
    return new Promise<firebase.User>((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            if (user) resolve(user);
            else reject("Not authenticated");
        });
    });
}