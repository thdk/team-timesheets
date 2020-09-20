import { useStore } from "../store-context";

export const useDivisionStore = () => {
    const store = useStore();
    return store.divisions;
}