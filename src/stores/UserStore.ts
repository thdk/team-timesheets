import { observable, action } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { getLoggedInUserAsync, firestorable } from "../Firestorable/Firestorable";
import { goToLogin } from "../routes/login";
import { IRootStore } from "./RootStore";

export interface IUserStore {
    defaultTask: string;
    user?: Partial<IUser> & Pick<firebase.User, "uid" | "email" | "displayName">;
    setUser: (fbUser: firebase.User | null) => void;
}

export interface IUser {

}

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    private rootStore: IRootStore;
    @observable defaultTask: string;
    @observable user?: IUserStore["user"];
    @observable state = StoreState.Done;

    private readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.users = new Collection<IUser>(rootStore.getCollection.bind(this, "users"));
        this.defaultTask = "HIBd74BItKoURLdQJmLf";

        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));
    }

    @action
    public setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            this.user = undefined;
        }
        else {
            this.state = StoreState.Pending;
            this.users.getAsync(fbUser.uid).then(user => this.getUserSuccess(user, fbUser), this.getUserError);
        }
    }

    @action.bound
    getUserSuccess = (user: Doc<IUser> | undefined, fbUser: firebase.User) => {
        this.state = StoreState.Done;

        const userData = user ? user.data : {};

        this.user = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            ...userData
        }
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }

}