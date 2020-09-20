import { IRootStore } from "../stores/root-store";

export const selectDivision = (store: IRootStore) => {
    return store.user.authenticatedUser?.divisionId;
};

export const setDivision = (store: IRootStore, divisionId: string | undefined) => {
    if (store.user.authenticatedUser) {
        store.user.authenticatedUser.divisionId = divisionId;
    }
};
