import { observable, action, transaction, computed } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IRootStore } from "./RootStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IUserStore {
    defaultTask: string;
    user: (Doc<IUser> & Pick<firebase.User, "email" | "displayName">) | undefined;
    setUser: (fbUser: firebase.User | null) => void;
    save: () => void;
}

export interface IUser {
    tasks: Map<string, true>;
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
    @observable.ref userId?: string;
    @observable.ref fbUser?: firebase.User
    @observable state = StoreState.Done;

    private readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.users = new Collection(rootStore.getCollection.bind(this, "users"), {
            realtime: true,
            serialize: serializer.convertUser,
            deserialize: deserializer.convertUser
        });

        this.defaultTask = "HIBd74BItKoURLdQJmLf";

        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));

        // TODO: this is not good. we only need a single user!
        this.users.getDocs();
    }

    public save() {
        if (!this.user) return;
        this.rootStore.getCollection("users").doc(this.user.id).set(
            { tasks: Array.from(this.user.data!.tasks.keys()) }
        );
    }

    @computed public get user() {

        if (this.userId && this.fbUser){
            const user = this.users.docs.get(this.userId);
            return user
            ? Object.assign(user, { email: this.fbUser.email, displayName: this.fbUser.displayName })
            : undefined;
        }

        return undefined;
    }

    @action
    public setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            this.userId = "none"; // userid should be observable ref?
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
            this.userId = user.id;
            this.fbUser = fbUser;
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }

}