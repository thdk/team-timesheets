import { observable, action, transaction, computed, observe, intercept, IObservableValue, reaction } from "mobx";
import { ICollection, Collection, Doc, RealtimeMode, FetchMode, CollectionReference } from "firestorable";
import { IRootStore } from "../root-store";
import * as deserializer from "../../../common/serialization/deserializer";
import * as serializer from "../../../common/serialization/serializer";
import { IUser, IUserData } from "../../../common/dist";
import { canReadUsers } from "../../rules/rules";
import { getLoggedInUserAsync } from "../../firebase/firebase-utils";

export interface IUserStore extends UserStore { }

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
    private _authUser: IObservableValue<Doc<IUser, IUserData> | undefined> = observable.box(undefined);

    @observable.ref isAuthInitialised = false;

    private readonly _selectedUser = observable.box<IUser | undefined>();

    private _selectedUserId = observable.box<string | undefined>();

    private auth?: firebase.auth.Auth;

    public readonly usersCollection: ICollection<IUser, IUserData>;
    constructor(
        _rootStore: IRootStore,
        {
            firestore,
            auth,
        }: {
            firestore: firebase.firestore.Firestore,
            auth?: firebase.auth.Auth,
        }
    ) {
        this.auth = auth;

        const query = (ref: CollectionReference) => ref.orderBy("name", "asc");
        const createQuery = (user?: IUser) => {
            return canReadUsers(user)
                ? query
                : null;
        };

        this.usersCollection = new Collection(firestore,
            "users"
            , {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.once,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
                query: null,
            },
            {
                logger: console.log,
            },
        );

        reaction(() => this.authenticatedUser, user => {
            this.usersCollection.query = createQuery(user);
        });

        this.auth && this.auth.onAuthStateChanged(this.setUser.bind(this));

        // tODO: move to Firestorable/Document?
        intercept(this._authUser, change => {
            if (change.type === "update") {
                if (!change.newValue && change.object.value) {
                    change.object.value.unwatch();
                }
            }

            return change;
        });

        observe(this._selectedUserId, change => this.setSelectedUser(change.newValue));
    }

    @action
    private setSelectedUser(id: string | undefined): void {

        const user: Doc<IUser, IUserData> | undefined = id ? this.usersCollection.get(id) : undefined;

        if (id && !user) {
            // fetch the user manually
            this.usersCollection.getAsync(id, { watch: true })
                .then(this.setSelectedUserObservable.bind(this));
        } else {
            this.setSelectedUserObservable(user);
        }
    }

    public updateSelectedUser(data: Partial<IUser>): void {
        if (this.selectedUser) { this._selectedUser.set({ ...this.selectedUser, ...data }); }
    }

    public saveSelectedUser(): void {
        if (this.selectedUserId && this.selectedUser) { this.usersCollection.updateAsync(this.selectedUser, this.selectedUserId || ""); }
    }

    @computed
    public get users() {
        return this.usersCollection.docs
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .sort((a, b) => {
                // TODO: Use stable sort method
                return (a.name || "") > (b.name || "")
                    ? 1
                    : -1;
            });;
    }

    @action.bound
    private setSelectedUserObservable(userDoc: Doc<IUser, IUserData> | undefined): void {
        this._selectedUser.set(userDoc && userDoc.data ? { ...userDoc.data } : undefined);
    }

    @computed
    public get selectedUser(): IUser | undefined {
        return this._selectedUser.get();
    }

    @action
    public setSelectedUserId(id: string | undefined): void {
        this._selectedUserId.set(id);
    }

    @computed
    public get selectedUserId(): string | undefined {
        return this._selectedUserId.get();
    }

    @computed
    public get authenticatedUser(): (IUser & { id: string }) | undefined {
        const user = this._authUser.get();
        return user ? { ...user.data!, id: user.id } : user;
    }

    @computed
    get authenticatedUserId(): string | undefined {
        return this._userId;
    }

    @action
    public updateAuthenticatedUser(userData: Partial<IUser>): void {
        const user = this._authUser.get();
        if (user) { this.usersCollection.updateAsync(userData, user.id); }
    }

    @action
    public setUser(fbUser: firebase.User | null): void {
        if (!fbUser) {
            transaction(() => {
                this.isAuthInitialised = true;
                this._userId = undefined;
                this._authUser.set(undefined);
            });
        } else {
            this.state = StoreState.Pending;
            this.usersCollection.getAsync(fbUser.uid).then(user => {
                this.getAuthUserSuccess(user);
            }, () => this.usersCollection.addAsync(
                {
                    roles: { user: true },
                    name: fbUser.displayName || "",
                    tasks: new Map(),
                    recentProjects: [],
                }
                , fbUser.uid).then(() => {
                    // get the newly registered user
                    return this.usersCollection.getAsync(fbUser.uid).then(user => {
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
            this._authUser.set(user);
            this.isAuthInitialised = true;
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.log(error);
        this.state = StoreState.Error;
    }

    signout(): void {
        this.auth && this.auth.signOut();
    }

    public getLoggedInUserAsync() {
        return this.auth
            ? getLoggedInUserAsync(this.auth)
            : Promise.reject(new Error("Firebase auth not initialized"));
    }

    // TODO: should be taken from context using FirebaseProvider component
    public get firebaseAuth() {
        return this.auth;
    }
}
