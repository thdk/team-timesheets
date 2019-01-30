import { observable, action, transaction, computed } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IRootStore } from "./RootStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IUserStore {
    readonly userId?: string;
    /**
     * Deprecated: use currentUser
     */
    readonly user: (Doc<IUser> & Pick<firebase.User, "email" | "displayName">) | undefined;
    readonly currentUser?: IUser;
    readonly setUser: (fbUser: firebase.User | null) => void;
    readonly users: ICollection<IUser>;
}

export interface IRoles {
    admin?: boolean;
    user?: boolean;
}

export type RecentlyUsedProjects = string[];

export interface IUser {
    tasks: Map<string, true>;
    roles: IRoles;
    name: string;
    defaultTask?: string;
    recentProjects: RecentlyUsedProjects;
    defaultClient?: string;
}

export interface IUserData {
    tasks?: string[];
    roles?: IRoles;
    name?: string;
    defaultTask: string;
    defaultClient?: string;
    recentProjects?: RecentlyUsedProjects;
}

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    // private rootStore: IRootStore;
    @observable.ref userId?: string;
    @observable.ref fbUser?: firebase.User
    @observable state = StoreState.Done;

    public readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        // this.rootStore = rootStore;
        this.users = new Collection(rootStore.getCollection.bind(this, "users"), {
            realtime: true,
            serialize: serializer.convertUser,
            deserialize: deserializer.convertUser
        });

        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));

        // TODO: this is not good. we only need a single user!
        this.users.getDocs();
    }

    @computed public get user() {
        // TODO: should return a type of IUser (see currentUser)
        if (this.userId && this.fbUser) {
            const user = this.users.docs.get(this.userId);
            return user
                ? Object.assign(user, { email: this.fbUser.email, displayName: this.fbUser.displayName })
                : undefined;
        }

        return undefined;
    }

    @computed public get currentUser() {
        if (!this.userId) return undefined;

        const user = this.users.docs.get(this.userId);
        if (!user) throw new Error("No user found in collection for the currentUser: " + this.userId);

        return user.data!;
    }

    @action
    public setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            this.userId = undefined;
        }
        else {
            this.state = StoreState.Pending;
            this.users.getAsync(fbUser.uid).then(user => {
                this.getUserSuccess(user, fbUser);
            }, () => this.users.addAsync(
                {
                    roles: { user: true },
                    name: fbUser.displayName || "",
                    tasks: new Map(),
                    recentProjects: []
                }
                , fbUser.uid).then(() => {
                    // get the newly registered user
                    return this.users.getAsync(fbUser.uid).then(user => {
                        this.getUserSuccess(user, fbUser);
                    }, this.getUserError);
                }, error => console.log(`${error}\nCoudn't save newly registered user. `)));
        }
    }

    @action.bound
    getUserSuccess = (user: Doc<IUser>, fbUser: firebase.User) => {
        transaction(() => {
            this.state = StoreState.Done;
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