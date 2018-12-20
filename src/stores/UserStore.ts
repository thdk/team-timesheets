import { observable, action, transaction, extendObservable } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IRootStore } from "./RootStore";

export interface IUserStore {
    defaultTask: string;
    user: (Doc<IUser> & Pick<firebase.User, "email" | "displayName">) | {};
    setUser: (fbUser: firebase.User | null) => void;
    save: () => void;
}

export interface IUser {
    tasks: Map<string, true>;
    id: string;
}

export interface IUserData {
    tasks?: string[];
}

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    private rootStore: IRootStore;
    @observable defaultTask: string;
    @observable user: IUserStore["user"];
    @observable state = StoreState.Done;

    private readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.users = new Collection<IUser>(rootStore.getCollection.bind(this, "users"));
        this.defaultTask = "HIBd74BItKoURLdQJmLf";

        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));

        this.user = {};
    }

    public save() {
        if (!(this.user instanceof (Doc))) return;
        this.rootStore.getCollection("users").doc(this.user!.id).set(
            { tasks: Array.from(this.user!.data!.tasks!.keys()) }
        );
    }

    @action
    public setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            this.user = {};
        }
        else {
            this.state = StoreState.Pending;
            this.users.getOrCreateAsync(fbUser.uid).then(user => this.getUserSuccess(user, fbUser), this.getUserError);
        }
    }

    @action.bound
    getUserSuccess = (user: Doc<IUser>, fbUser: firebase.User) => {
        this.state = StoreState.Done;
        transaction(() => {
            this.user = user;
            extendObservable(this.user, { email: fbUser.email, displayName: fbUser.displayName });
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }

}