import { observable, action, transaction, computed, observe, reaction, IObservableValue, intercept } from "mobx";
import { ICollection, Collection, Doc, RealtimeMode, FetchMode, CollectionReference } from "firestorable";
import { IRootStore } from "../root-store";
import * as deserializer from "../../../common/serialization/deserializer";
import * as serializer from "../../../common/serialization/serializer";
import { IUser, IUserData } from "../../../common/dist";
import { canReadUsers } from "../../rules";
import { getLoggedInUserAsync } from "../../firebase/firebase-utils";

export interface IUserStore extends UserStore { }

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    @observable state = StoreState.Done;

    @observable.ref isAuthInitialised = false;

    @observable
    private _authUser: IObservableValue<Doc<IUser, IUserData> | undefined> = observable.box(undefined);

    @observable
    private _divisionUser: IObservableValue<Doc<IUser, IUserData> | undefined> = observable.box(undefined);

    private readonly _selectedUser = observable.box<IUser | undefined>();

    private _selectedUserId = observable.box<string | undefined>();

    private auth?: firebase.auth.Auth;

    public readonly usersCollection: ICollection<IUser, IUserData>;
    public readonly divisionUsersCollection: ICollection<IUser, IUserData>;
    public readonly divisionUsersAllCollection: ICollection<IUser, IUserData>;

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

        const createQuery = (user?: IUser) => {
            const query = (ref: CollectionReference) => ref.orderBy("name", "asc");
            return canReadUsers(user)
                ? query
                : null;
        };

        this.usersCollection = new Collection(firestore,
            "users"
            , {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
                query: null,
            },
            {
                // logger: console.log,
            },
        );

        this.divisionUsersCollection = new Collection(
            firestore,
            "division-users",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.auto,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
                query: null,
            }, {
            // logger: console.log
        });

        this.divisionUsersAllCollection = new Collection(
            firestore,
            "division-users",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.auto,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
                query: (ref) => ref
                    .where("divisionId", "==", this.divisionUser?.divisionId)
                    .where("deleted", "==", false),
            }, {
            // logger: console.log
        });

        reaction(() => this.divisionUser, user => {
            this.usersCollection.query = createQuery(user);
            this.usersCollection.fetchAsync();
        });

        reaction(() => this.authenticatedUser, user => {
            this.setDivisionUser(user?.divisionUserId);
        });

        reaction(() => this.authenticatedUserId, id => {
            if (id) {
                this.divisionUsersCollection.query = ref => ref
                    .where("uid", "==", id)
                    .where("deleted", "==", false)
                    .orderBy("created");
            } else {
                this.divisionUsersCollection.query = null;
            }
        })

        this.auth && this.auth.onAuthStateChanged(this.setUser.bind(this));

        // TODO: move to Firestorable/Document?
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
        const collection = this.divisionUser?.divisionId
            ? this.divisionUsersCollection
            : this.usersCollection;

        const user: Doc<IUser, IUserData> | undefined = id ? collection.get(id) : undefined;

        if (id && !user) {
            // fetch the user manually
            collection.getAsync(id, { watch: true })
                .then(user => {
                    this.setSelectedUserObservable(user);
                })
                .catch(console.error);
        } else {
            this.setSelectedUserObservable(user);
        }
    }

    public updateSelectedUser(data: Partial<IUser>): void {
        if (this.selectedUser) { this._selectedUser.set({ ...this.selectedUser, ...data }); }
    }

    public saveSelectedUser(): void {
        const collection = this.divisionUser?.divisionId
            ? this.divisionUsersCollection
            : this.usersCollection;

        if (this.selectedUserId && this.selectedUser) { collection.updateAsync(this.selectedUser, this.selectedUserId || ""); }
    }

    @computed
    public get users() {
        const collection = this.divisionUser?.divisionId
            ? this.divisionUsersAllCollection
            : this.usersCollection;

        return collection.docs
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
        return this.authenticatedUser?.id;
    }

    @computed
    public get divisionUser(): (IUser & { id: string }) | undefined {
        const divisionUser = this._divisionUser.get();

        if (!divisionUser && this.authenticatedUser?.divisionUserId) {
            // wait for division user to be loaded
            return undefined;
        }

        return divisionUser
            ? { ...divisionUser.data!, id: divisionUser.id }
            : this.authenticatedUser;
    }

    @action
    private setDivisionUser(id: string | undefined) {
        if (!id) {
            this._divisionUser.set(undefined);
        } else {
            this.divisionUsersCollection.getAsync(id)
                .then(this.setDivisionUserSuccess)
                .catch(() => {
                    this.setDivisionUserSuccess(undefined);
                });
        }
    }

    @action.bound
    private setDivisionUserSuccess(result: Doc<IUser> | undefined) {
        this._divisionUser.set(result);
    }

    public updateDivisionUser(userData: Partial<IUser>): void {
        const user = this.divisionUser;
        if (user) { this.divisionUsersCollection.updateAsync(userData, user.id); }
    }

    public updateAuthenticatedUser(userData: Partial<IUser>): void {
        const user = this.authenticatedUser;
        if (user) { this.usersCollection.updateAsync(userData, user.id); }
    }

    @action
    public setUser(fbUser: firebase.User | null): void {
        if (!fbUser) {
            transaction(() => {
                this.isAuthInitialised = true;
                this._authUser.set(undefined);
            });

            if (typeof gapi !== "undefined") {
                gapi.auth2.getAuthInstance().signOut();
            }
        } else {
            this.state = StoreState.Pending;

            this.getAuthenticatedUserAsync(fbUser)
                .then((user) => {
                    this.getAuthUserSuccess(user);
                }, () => {
                    const newUserData = {
                        roles: { user: true },
                        name: fbUser.displayName || "",
                        tasks: new Map(),
                        recentProjects: [],
                        email: fbUser.email || undefined,
                        uid: fbUser.uid,
                    };

                    this.usersCollection.addAsync(
                        newUserData,
                        fbUser.uid,
                    ).then(
                        (userId) => {
                            // get the newly registered user
                            return this.usersCollection.getAsync(userId)
                                .then((user) => {
                                    this.getAuthUserSuccess(user);
                                }, this.getUserError);
                        },
                        error => console.log(`${error}\nCoudn't save newly registered user. `),
                    );
                });
        }
    }

    private getAuthenticatedUserAsync(fbUser: firebase.User): Promise<Doc<IUser> | undefined> {
        return this.usersCollection.getAsync(fbUser.uid)
            .then(async (userDoc) => {
                if (!userDoc.data!.uid || !userDoc.data!.email) {
                    // backwords compatibility, get single user by id and patch user data
                    await this.usersCollection.updateAsync(
                        {
                            email: fbUser.email || "",
                            uid: fbUser.uid,
                        },
                        fbUser.uid,
                    );
                }
                return userDoc;
            });
    }

    @action.bound
    getAuthUserSuccess = (authUser: Doc<IUser> | undefined) => {
        transaction(() => {
            this.state = StoreState.Done;
            this.isAuthInitialised = true;
            this._authUser.set(authUser);
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

    public dispose() {
        this.usersCollection.dispose();
        this.divisionUsersCollection.dispose();
    }
}
