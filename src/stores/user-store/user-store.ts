import { observable, action, transaction, computed, observe, reaction } from "mobx";
import { ICollection, Collection, Doc, RealtimeMode, FetchMode, CollectionReference } from "firestorable";
import { IRootStore } from "../root-store";
import * as deserializer from "../../../common/serialization/deserializer";
import * as serializer from "../../../common/serialization/serializer";
import { IUser, IUserData } from "../../../common/dist";
import { canReadUsers } from "../../rules";
import { getLoggedInUserAsync } from "../../firebase/firebase-utils";
import { selectOrganisation } from "../../selectors/select-organisation";

export interface IUserStore extends UserStore { }

export enum StoreState {
    Done,
    Pending,
    Error
}

export class UserStore implements IUserStore {
    @observable state = StoreState.Done;

    @observable.ref isAuthInitialised = false;
    @observable.ref
    private _fbUser: firebase.User | null = null;

    private readonly _selectedUser = observable.box<IUser | undefined>();

    private _selectedUserId = observable.box<string | undefined>();

    private auth?: firebase.auth.Auth;

    public readonly usersCollection: ICollection<IUser, IUserData>;
    public readonly organisationUsersCollection: ICollection<IUser, IUserData>;

    private rootStore: IRootStore;
    constructor(
        rootStore: IRootStore,
        {
            firestore,
            auth,
        }: {
            firestore: firebase.firestore.Firestore,
            auth?: firebase.auth.Auth,
        }
    ) {
        this.auth = auth;
        this.rootStore = rootStore;

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
                fetchMode: FetchMode.once,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
                query: null,
            },
            {
                // logger: console.log,
            },
        );

        this.organisationUsersCollection = new Collection(
            firestore,
            "users",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
            }, {
            // logger: console.log
        })

        reaction(() => this.authenticatedUser, user => {
            this.usersCollection.query = createQuery(user);
        });

        this.auth && this.auth.onAuthStateChanged(this.setUser.bind(this));

        // // TODO: move to Firestorable/Document?
        // intercept(this._authUser, change => {
        //     if (change.type === "update") {
        //         if (!change.newValue && change.object.value) {
        //             change.object.value.unwatch();
        //         }
        //     }

        //     return change;
        // });

        observe(this._selectedUserId, change => this.setSelectedUser(change.newValue));
    }

    @action
    private setSelectedUser(id: string | undefined): void {

        const user: Doc<IUser, IUserData> | undefined = id ? this.usersCollection.get(id) : undefined;

        if (id && !user) {
            // fetch the user manually
            this.usersCollection.getAsync(id, { watch: true })
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
    public get authenticatedUser(): IUser | undefined {
        if (!this._fbUser) {
            return undefined;
        }

        console.log("user not set to null");

        const selectedOrganisationId = selectOrganisation(this.rootStore);

        const user = selectedOrganisationId
            ? this.organisationUsersCollection.docs
                .filter(d => d.data!.organisationId === selectedOrganisationId)[0]
            : this.organisationUsersCollection.docs[0];

        return user ? { ...user.data!} : user;
    }

    @computed
    get authenticatedUserId(): string | undefined {
        return this.authenticatedUser?.uid;
    }

    @action
    public updateAuthenticatedUser(userData: Partial<IUser>): void {
        const user = this.authenticatedUser;
        if (user) { this.usersCollection.updateAsync(userData, user.uid); }
    }

    @action
    public setUser(fbUser: firebase.User | null): void {
        if (!fbUser) {
            transaction(() => {
                this.isAuthInitialised = true;
                this._fbUser = fbUser;
            });

            if (typeof gapi !== "undefined") {
                gapi.auth2.getAuthInstance().signOut();
            }
        } else {
            this.state = StoreState.Pending;
            this.organisationUsersCollection.query = (ref) => ref.where("uid", "==", fbUser.uid);
            this.organisationUsersCollection.fetchAsync()
                .then(
                    async () => {
                        const user = await this.getAuthenticatedUserAsync(fbUser);
                        if (user) {
                            this.getAuthUserSuccess(fbUser);
                        } else {
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
                                        .then(() => {
                                            this.getAuthUserSuccess(fbUser);
                                        }, this.getUserError);
                                },
                                error => console.log(`${error}\nCoudn't save newly registered user. `),
                            );
                        }
                    },
                );
        }
    }

    private getAuthenticatedUserAsync(fbUser: firebase.User) {
        const organisationUsers = this.organisationUsersCollection.docs;
        if (organisationUsers.length) {
            return Promise.resolve(organisationUsers[0]);
        } else {
            // backwords compatibility, get single user by id and patch user data
            return this.usersCollection.getAsync(fbUser.uid)
                .then(async (userDoc) => {
                    await this.usersCollection.updateAsync(
                        {
                            email: fbUser.email || "",
                            uid: fbUser.uid,
                        },
                        fbUser.uid,
                    );
                    userDoc.data!.email = fbUser.email || undefined;
                    userDoc.data!.uid = fbUser.uid;
                    return userDoc;
                })
                .catch(() => {
                    return undefined;
                });
        }
    }

    @action.bound
    getAuthUserSuccess = (fbUser: firebase.User | null) => {
        transaction(() => {
            this.state = StoreState.Done;
            this.isAuthInitialised = true;
            this._fbUser = fbUser;
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
    }
}
