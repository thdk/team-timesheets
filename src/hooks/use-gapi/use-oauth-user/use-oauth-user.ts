import { useQuery } from "react-query";
import { useOAuth } from "../../../oauth/use-oauth";

export const useOAuthUser = <T>({
   getUser,
   ...oauthArgs
}: {
    getUser: (accessToken: string) => Promise<T>,
} & Parameters<typeof useOAuth>[0]) => {
    const oauthResult = useOAuth(
        oauthArgs,
    );

    const userQueryResult = useQuery(
        [
            "oauth-user",
            oauthResult.accessToken,
        ],
        () => {
            if (!oauthResult.accessToken) {
                return undefined;
            }

            return getUser(oauthResult.accessToken);
        },
        {
            enabled: !!oauthResult.accessToken,
            onError: () => oauthResult.setAccessToken(undefined),
        },
    );

    return {
        oauth: oauthResult,
        ...userQueryResult,
    };
};
