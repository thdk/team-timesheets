import { observable, action, transaction, computed, IObservableValue, observe } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IRootStore } from "./RootStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';

export interface IUserStore {
    readonly userId?: string;
    readonly currentUser?: IUser;
    readonly users: ICollection<IUser>;
    readonly updateUser: (userData: Partial<IUser>) => void;
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
    @observable.ref userId?: string;
    @observable state = StoreState.Done;
    public readonly user: IObservableValue<IUser | undefined>;

    public readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        this.users = new Collection(rootStore.getCollection.bind(this, "users"), {
            realtime: false,
            serialize: serializer.convertUser,
            deserialize: deserializer.convertUser
        });

        this.user = observable.box();
        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));

        observe(this.user, change => {
            change.newValue && this.userId &&
                this.users.updateAsync(this.userId, change.newValue);
        });
    }

    @computed public get currentUser() {
        return this.user.get();
    }

    @action
    public updateUser(userData: Partial<IUser>) {
        const user = this.user.get();
        if (user) this.user.set({ ...user, ...userData });
    }

    @action
    private setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            this.userId = undefined;
            this.user.set(undefined);
        }
        else {
            this.state = StoreState.Pending;
            this.users.getAsync(fbUser.uid).then(user => {
                this.getUserSuccess(user);
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
                        this.getUserSuccess(user);
                    }, this.getUserError);
                }, error => console.log(`${error}\nCoudn't save newly registered user. `)));
        }
    }

    @action.bound
    getUserSuccess = (user: Doc<IUser>) => {
        transaction(() => {
            this.state = StoreState.Done;
            this.userId = user.id;
            this.user.set(user.data);
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }
}