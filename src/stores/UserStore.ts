import { observable } from "mobx";
import { IRootStore } from "../store";

export interface IUserStore {
    defaultTask: string;
}

export class UserStore implements IUserStore {
    private rootStore: IRootStore;
    @observable defaultTask: string;
    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.defaultTask = "";
    }
}