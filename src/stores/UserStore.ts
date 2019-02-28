import { observable, action, transaction, computed, observe, when } from "mobx";
import { ICollection, Collection } from "../Firestorable/Collection";
import { Doc } from "../Firestorable/Document";
import { firestorable } from "../Firestorable/Firestorable";
import { IRootStore } from "./RootStore";
import * as deserializer from '../serialization/deserializer';
import * as serializer from '../serialization/serializer';
import { IUser } from "../../common/dist";
import { canReadUsers } from "../rules/rules";

export interface IUserStore {
    readonly userId?: string;
    readonly authenticatedUser?: IUser;
    readonly selectedUser?: IUser;
    readonly selectedUserId: string | undefined;
    readonly setSelectedUserId: (id: string | undefined) => void;
    readonly saveSelectedUser: () => void;
    readonly updateSelectedUser: (data: Partial<IUser>) => void;
    readonly users: ICollection<IUser>;
    readonly updateUser: (userData: Partial<IUser>) => void;
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
    private readonly _authUser = observable.box<IUser | undefined>();
    private readonly _selectedUser = observable.box<IUser | undefined>();

    private _selectedUserId = observable.box<string | undefined>();

    public readonly users: ICollection<IUser>;
    constructor(rootStore: IRootStore) {
        this.users = new Collection(rootStore.getCollection.bind(this, "users"), {
            realtime: true,
            serialize: serializer.convertUser,
            deserialize: deserializer.convertUser
        });

        when(() => !!this.authenticatedUser, () => {
            if (canReadUsers(this.authenticatedUser)) {
                this.users.query = ref => ref.orderBy("name", "asc");
            }
        });

        firestorable.auth.onAuthStateChanged(this.setUser.bind(this));

        observe(this._authUser, change => {
            change.newValue && this.userId &&
                this.users.updateAsync(this.userId, change.newValue);
        });

        observe(this._selectedUserId, change => this.setSelectedUser(change.newValue));
    }

    @action
    private setSelectedUser(id: string | undefined) {
        const user = id ? this.users.docs.get(id) : undefined;

        if (id && !user) {
            // fetch the user manually
            this.users.getAsync(id)
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
    private setSelectedUserObservable(userDoc: Doc<IUser> | undefined) {
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
        return this._authUser.get();
    }

    @computed
    get userId() {
        return this._userId;
    }

    @action
    public updateUser(userData: Partial<IUser>) {
        const user = this._authUser.get();
        if (user) this._authUser.set({ ...user, ...userData });
    }

    @action
    private setUser(fbUser: firebase.User | null) {
        if (!fbUser) {
            transaction(() => {
                this._userId = undefined;
                this._authUser.set(undefined);
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
    getAuthUserSuccess = (user: Doc<IUser>) => {
        transaction(() => {
            this.state = StoreState.Done;
            this._userId = user.id;
            this._authUser.set(user.data);
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }
}