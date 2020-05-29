import { useStore } from "../../contexts/store-context";

export const useRouterStore = () => {
    const store = useStore();

    return store.router;
}
