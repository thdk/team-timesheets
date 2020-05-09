import { useStore } from "../../contexts/store-context";

export const useReportStore = () => {
    const store = useStore();
    return store.reports;
};