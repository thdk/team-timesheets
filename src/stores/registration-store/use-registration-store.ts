import { useStore } from "../../contexts/store-context";

export const useRegistrationStore = () => {
    const { timesheets: registrations } = useStore();
    return registrations;
}