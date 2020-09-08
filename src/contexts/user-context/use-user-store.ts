import { useStore } from "../store-context";

export const useUserStore = () => {
    const store = useStore();

    return store.user;
};
