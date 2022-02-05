import * as functions from 'firebase-functions';
import axios from "axios";

import { db } from "./firebase";

exports.getAccessToken = functions.https.onCall(async ({ code, providerId }: { code: string; providerId: string; }) => {
    const doc = await db.collection("oauth-providers")
        .doc(providerId)
        .get();

    const {
        clientId,
        accessTokenUrl,
        secret,
    } = doc.data();

    const result = await axios.post(
        accessTokenUrl,
        {
            client_id: clientId,
            code,
            client_secret: secret,
        },
        {
            headers: {
                Accept: "application/json",
            },
        },
    );

    return result.data;
});

exports.revokeGithubAccessToken = functions.https.onCall(async ({ token, providerId }: { token: string; providerId: string }) => {
    const doc = await db.collection("oauth-providers")
        .doc(providerId)
        .get();

    const {
        clientId,
        secret,
    } = doc.data();

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const result = await axios.delete(
        `https://api.github.com/applications/${clientId}/grant`,
        {
            headers: {
                Accept: "application/json",
                Authorization: `Basic ${auth}`,
            },
            data: {
                access_token: token,
            },
        },
    );

    return result.status;
});
