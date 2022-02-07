import { createContext, useContext} from "react";

export type AuthContextData = {
    clientId: string;
    id: string;
    authorizeUrl: string;
    accessTokenUrl?: string;
    redirectUrl?: string;
    scope?: string;
    state?: string;
}

export const AuthContext = createContext<AuthContextData[]>([]);

export const useAuthContext = () => useContext(AuthContext);
