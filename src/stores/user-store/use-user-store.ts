import { useStore } from "../../contexts/store-context";

export const useUserStore = () => {
    const { user } = useStore();

    return user;
};
