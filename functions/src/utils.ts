import { IFirebaseConfig } from "./interfaces";

export const getAdminConfig = () => {
    const config: IFirebaseConfig | undefined = process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG);
    if (!config) {
        throw new Error("Firebase functions should have process.env.FIREBASE_CONFIG set.");
    }
    return config;
};
