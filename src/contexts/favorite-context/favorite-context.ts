import { useStore } from "../store-context";

export const useFavoriteGroupStore = () => {
    const store = useStore();
    return store.favorites;
};
