import { useStore } from "../../contexts/store-context";
import { useObserver } from "mobx-react-lite";

export const useViewStore = () => {
    const store = useStore();
    const view = store.view;
    return useObserver(() => ({
        moment: view.moment,
        actions: view.actions,
        fabs: view.fabs,
        isDrawerOpen: view.isDrawerOpen,
        monthMoment: view.monthMoment,
        removeAction: view.removeAction.bind(view),
        selection: view.selection,
        setActions: view.setActions.bind(view),
        setFabs: view.setFabs.bind(view),
        setNavigation: view.setNavigation.bind(view),
        setViewDate: view.setViewDate.bind(view),
        title: view.title,
        toggleSelection: view.toggleSelection.bind(view),
        day: view.day,
        month: view.month,
        navigationAction: view.navigationAction,
        track: view.track,
        year: view.year,
    }));
};