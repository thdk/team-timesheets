import { useStore } from "../store-context";

export const useRegistrationStore = () => {
    const { timesheets: registrations } = useStore();
    return registrations;
}