import { useStore } from "../../contexts/store-context";
import { useObserver } from "mobx-react-lite";

export const useViewStore = () => {
    const store = useStore();

    return useObserver(() => ({
        selection: store.view.selection,
        toggleSelection: store.view.toggleSelection.bind(store.view)
    }));
};