import '@types/node';
import { LoginProvider } from './firebase/types';

const configs: Environments = {
    default: {
        firebaseAuth: {
            providers: [LoginProvider.Google],
        }
    },
    development: {
        firebaseAuth: {
            providers: [LoginProvider.Google, LoginProvider.Email],
        }
    },
};

// DO NOT EDIT BELOW THIS LINE (unless you are the developer)

export interface IAppConfig {
    firebaseAuth: {
        providers: LoginProvider[];
        tosUrl?: string;
        privacyPolicyUrl?: string;
    }
}

type Environments = {
    "default": IAppConfig,
    "development"?: Partial<IAppConfig>,
    "staging"?: Partial<IAppConfig>,
    "production"?: Partial<IAppConfig>
}

export const config = { ...configs["default"], ...(configs as any)[process.env.NODE_ENV || "development"] }
