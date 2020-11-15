import { useStore } from "../store-context";

export const useAuthStore = () => {
    const store = useStore();

    return store.auth;
};
