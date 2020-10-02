import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export const getDivisionByEntryCode = functions.https.onCall((code: string, context) => {
    if (!(typeof code === 'string') || !code.length) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "code" containing the invite code for the division.');
    }
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }

    return admin.firestore().collection("division-codes")
        .where("code", "==", code)
        .get()
        .then(
            (snapshot) => {
                console.log(code);
                if (snapshot.size > 1) {
                    throw new Error("Multiple divisions found for entrycode: " + code);
                }

                if (snapshot.size) {
                    console.log("OK4");
                    return snapshot.docs[0].data().divisionId;
                }
                console.log("OK5");

                return undefined;
            }
        )
        .catch(e => {
            throw new functions.https.HttpsError('internal', 'getDivisionByEntryCode failed', e);
        });
});
