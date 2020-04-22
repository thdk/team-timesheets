import { useStore } from "../../contexts/store-context";
import { useObserver } from "mobx-react-lite";

export const useUserStore = () => {
    const {user} = useStore();

    return useObserver(() => ({
        authenticatedUser: user.authenticatedUser,
        authenticatedUserId: user.authenticatedUserId,
    }));
};
