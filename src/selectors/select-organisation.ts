import { IRootStore } from "../stores/root-store";

export const selectOrganisation = (store: IRootStore) => {
    return store.getOrganisationId();
}
