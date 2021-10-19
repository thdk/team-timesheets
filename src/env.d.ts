declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FIREBASE_API_KEY: string;
            FIREBASE_AUTH_DOMAIN: string;
            FIREBASE_PROJECT_ID: string;
            FIREBASE_STORAGE_BUCKET: string;
        }
    }
}

// required
export {};
