import { observable, action, computed, reaction, IObservableValue, makeObservable } from "mobx";

import { ICollection, Collection, Doc, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from "../root-store";
import * as deserializer from "../../../common/serialization/deserializer";
import * as serializer from "../../../common/serialization/serializer";
import { IUser, IUserData } from "../../../common/dist";
import { canReadUsers } from "../../rules";
import { CollectionReference, Firestore, orderBy, Query, query, where } from "firebase/firestore";

export interface IUserStore extends UserStore { }

export class UserStore implements IUserStore {

    private _divisionUser: IObservableValue<Doc<IUser, IUserData> | undefined> = observable.box(undefined);

    private readonly _selectedUser = observable.box<IUser | undefined>();

    private _selectedUserId: string | undefined = undefined;

    public readonly usersCollection: ICollection<IUser, IUserData>;
    public readonly divisionUsersCollection: ICollection<IUser, IUserData>;
    public readonly divisionUsersAllCollection: ICollection<IUser, IUserData>;

    private readonly rootStore: IRootStore;

    private readonly reactionDisposeFns: (() => void)[];
    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: Firestore,
        }
    ) {
        makeObservable<UserStore, "_divisionUser" | "_selectedUserId" | "setSelectedUser" | "setSelectedUserObservable" | "setDivisionUser" | "setDivisionUserSuccess">(this, {
            _divisionUser: observable,
            _selectedUserId: observable.ref,
            setSelectedUser: action,
            users: computed,
            setSelectedUserObservable: action.bound,
            selectedUser: computed,
            setSelectedUserId: action,
            selectedUserId: computed,
            authenticatedUser: computed,
            authenticatedUserId: computed,
            divisionUser: computed,
            setDivisionUser: action,
            setDivisionUserSuccess: action.bound
        });

        this.rootStore = rootStore;

        const createQuery = (user?: IUser) => {
            const q = (ref: CollectionReference) =>
                query(ref, orderBy("name")) as Query<IUserData>;

            return canReadUsers(user)
                ? q
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
                defaultSetOptions: {
                    merge: true
                },
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
                defaultSetOptions: {
                    merge: true
                },
            },
            {
                // logger: console.log
            },
        );

        this.divisionUsersAllCollection = new Collection(
            firestore,
            "division-users",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.auto,
                serialize: serializer.convertUser,
                deserialize: deserializer.convertUser,
                query: (ref) => query(ref,
                    where("divisionId", "==", (this.divisionUser?.divisionId || "")),
                    where("deleted", "==", false)
                ),
            },
            {
                // logger: console.log
            },
        );

        this.reactionDisposeFns = [
            reaction(() => this.authenticatedUser, user => {
                if (
                    (canReadUsers(user) && !this.usersCollection.isFetched)
                    ||
                    (!canReadUsers(user) && this.usersCollection.isFetched)
                ) {
                    this.usersCollection.query = createQuery(user);
                    this.usersCollection.fetchAsync();
                }

                if (this._divisionUser.get()?.id !== user?.divisionUserId) {
                    this.setDivisionUser(user?.divisionUserId);
                }
            }),

            reaction(() => this.authenticatedUserId, id => {
                if (id) {
                    this.divisionUsersCollection.query = ref => query(ref,
                        where("uid", "==", id),
                        where("deleted", "==", false),
                        orderBy("created"),
                    );
                } else {
                    this.divisionUsersCollection.query = null;
                }
            }),
        ];

        // TODO: move to Firestorable/Document?
        // intercept(this._authUser, change => {
        //     if (change.type === "update") {
        //         if (!change.newValue && change.object.value) {
        //             change.object.value.unwatch();
        //         }
        //     }

        //     return change;
        // });

        reaction(() => this._selectedUserId, id => this.setSelectedUser(id));
    }

    private setSelectedUser(id: string | undefined): void {
        const collection = this.divisionUser?.divisionId
            ? this.divisionUsersAllCollection
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

    public get users() {
        const divisionId = this.divisionUser?.divisionId;

        const collection = divisionId
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

    private setSelectedUserObservable(userDoc: Doc<IUser, IUserData> | undefined): void {
        this._selectedUser.set(userDoc && userDoc.data ? { ...userDoc.data } : undefined);
    }

    public get selectedUser(): IUser | undefined {
        return this._selectedUser.get();
    }

    public setSelectedUserId(id: string | undefined): void {
        this._selectedUserId = id;
    }

    public get selectedUserId(): string | undefined {
        return this._selectedUserId;
    }

    public get authenticatedUser(): (IUser & { id: string }) | undefined {
        if (!this.rootStore.auth.activeDocumentId) {
            return undefined;
        }

        const user = this.rootStore.auth.activeDocument as IUser;
        return user ? { ...user!, id: user.uid } : user;
    }

    get authenticatedUserId(): string | undefined {
        return this.authenticatedUser?.id;
    }

    public get divisionUser(): (IUser & { id: string }) | undefined {
        const divisionUser = this._divisionUser.get();

        return divisionUser
            ? { ...divisionUser.data!, id: divisionUser.id }
            : this.authenticatedUser ? { ...this.authenticatedUser } : undefined;
    }

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

    private setDivisionUserSuccess(result: Doc<IUser> | undefined) {
        this._divisionUser.set(result);
    }

    public updateDivisionUser(userData: Partial<IUser>): void {
        const user = this.divisionUser;
        if (user) {
            if (this.divisionUser?.divisionId) {
                this.divisionUsersCollection.updateAsync(userData, user.id);
            } else {
                this.usersCollection.updateAsync(userData, user.id);
            }
        }
    }

    public updateAuthenticatedUser(userData: Partial<IUser>): void {
        const user = this.authenticatedUser;
        if (user) { this.usersCollection.updateAsync(userData, user.uid); }
    }

    public dispose() {
        this.reactionDisposeFns.forEach(fn => fn());
        this.usersCollection.dispose();
        this.divisionUsersCollection.dispose();
        this.divisionUsersAllCollection.dispose();
    }
}
