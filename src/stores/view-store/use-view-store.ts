import { useStore } from "../../contexts/store-context";

export const useViewStore = () => {
    const store = useStore();

    return store.view;
};