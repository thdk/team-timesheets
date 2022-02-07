import { useAuthContext } from "./oauth-context"

export const useOAuthProvider = (providerId: string) => {
    const providers = useAuthContext();

    const provider = providers
        .find((provider) => provider.id === providerId);

    if (!provider) {
        throw new Error(`No provider found with id: '${providerId}'`);
    }

    return provider;
}
