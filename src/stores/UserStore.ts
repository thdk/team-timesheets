import { observable, action, transaction, computed, observe, when, intercept } from "mobx";
import { ICollection, Collection, Doc } from 'firestorable';
import { IRootStore } from "./RootStore";
import * as deserializer from '../../common/serialization/deserializer';
import * as serializer from '../../common/serialization/serializer';
import { IUser, IUserData } from "../../common/dist";
import { canReadUsers } from "../rules/rules";

import { UndefinedValue, isUndefinedValue, Undefined } from "mobx-undefined-value";
import { firestore, auth } from "../firebase/myFirebase";

export interface IUserStore {
    readonly userId?: string;
    readonly authenticatedUser?: IUser;
    readonly selectedUser?: IUser;
    readonly selectedUserId: string | undefined;
    readonly setSelectedUserId: (id: string | undefined) => void;
    readonly saveSelectedUser: () => void;
    readonly updateSelectedUser: (data: Partial<IUser>) => void;
    readonly users: ICollection<IUser, IUserData>;
    readonly updateAuthenticatedUser: (userData: Partial<IUser>) => void;
    readonly signout: () => void;
}

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    @observable.ref
    private _userId?: string;

    @observable state = StoreState.Done;

    @observable
    private _authUser: Doc<IUser, IUserData> | Undefined = observable(UndefinedValue);

    private readonly _selectedUser = observable.box<IUser | undefined>();

    private _selectedUserId = observable.box<string | undefined>();

    public readonly users: ICollection<IUser, IUserData>;
    constructor(rootStore: IRootStore) {
        this.users = new Collection(firestore, rootStore.getCollection.bind(this, "users"), {
            realtime: true,
            serialize: serializer.convertUser,
            deserialize: deserializer.convertUser
        });

        when(() => !!this.authenticatedUser, () => {
            if (canReadUsers(this.authenticatedUser)) {
                this.users.query = ref => ref.orderBy("name", "asc");
            }
        });

        auth.onAuthStateChanged(this.setUser.bind(this));

        // TODO: move to Firestorable/Document?
        intercept(this._authUser, change => {
            if (change.type === "update") {
                if (isUndefinedValue(change.newValue)) {
                    change.object.unwatch();
                }
            }

            return change;
        });

        observe(this._selectedUserId, change => this.setSelectedUser(change.newValue));
    }

    @action
    private setSelectedUser(id: string | undefined) {
        const user = id ? this.users.docs.get(id) : undefined;

        if (id && !user) {
            // fetch the user manually
            this.users.getAsync(id, true)
                .then(this.setSelectedUserObservable.bind(this))
        } else {
            this.setSelectedUserObservable(user);
        }
    }

    public updateSelectedUser(data: Partial<IUser>) {
        this.selectedUser && this._selectedUser.set({ ...this.selectedUser, ...data });
    }

    public saveSelectedUser() {
        this.selectedUserId && this.selectedUser && this.users.updateAsync(this.selectedUserId, this.selectedUser);
    }

    @action.bound
    private setSelectedUserObservable(userDoc: Doc<IUser, IUserData> | undefined) {
        this._selectedUser.set(userDoc && userDoc.data ? { ...userDoc.data } : undefined);
    }

    @computed
    public get selectedUser() {
        return this._selectedUser.get();
    }

    @action
    public setSelectedUserId(id: string | undefined) {
        this._selectedUserId.set(id);
    }

    @computed
    public get selectedUserId() {
        return this._selectedUserId.get();
    }

    @computed
    public get authenticatedUser() {
        if (isUndefinedValue(this._authUser)) return undefined;

        return this._authUser.data;
    }

    @computed
    get userId() {
        return this._userId;
    }

    @action
    public updateAuthenticatedUser(userData: Partial<IUser>) {
        if (!isUndefinedValue(this._authUser)) this.users.updateAsync(this._authUser.id, userData);
    }

    @action
    private setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            transaction(() => {
                this._userId = undefined;
                this._authUser = UndefinedValue;
            });
        }
        else {
            this.state = StoreState.Pending;
            this.users.getAsync(fbUser.uid).then(user => {
                this.getAuthUserSuccess(user);
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
                        this.getAuthUserSuccess(user);
                    }, this.getUserError);
                }, error => console.log(`${error}\nCoudn't save newly registered user. `)));
        }
    }

    @action.bound
    getAuthUserSuccess = (user: Doc<IUser, IUserData>) => {
        transaction(() => {
            this.state = StoreState.Done;
            this._userId = user.id;
            this._authUser = user;
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }

    signout() {
        auth.signOut();
    }
}