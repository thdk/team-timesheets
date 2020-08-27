import { useStore } from "../store-context";

export const useUserStore = () => {
    const { user } = useStore();

    return user;
};
