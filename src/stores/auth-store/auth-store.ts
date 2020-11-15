import "firebase/auth";
import { action, transaction, observable, IObservableValue } from "mobx";
import { Doc } from "firestorable";
import { FirestorableStore, StoreOptions } from "../firestorable-store";

export type AuthStoreUser = {
    authDisplayName: string | undefined;
    authEmail: string | undefined;
    authUid: string;
}

/**
 * Resolves with firbase.User if user is logged in
 * Rejects if no user is logged in
 */
const getLoggedInUserAsync = (auth: firebase.auth.Auth) => {
    return new Promise<firebase.User>((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            if (user) resolve(user);
            else reject("Not authenticated");
        });
    });
}

export class AuthStore<T extends AuthStoreUser, K> extends FirestorableStore<T, K> {
    @observable.ref
    isAuthInitialised = false;

    @observable
    private _authUser: IObservableValue<Doc<T, K> | undefined> = observable.box(undefined);

    private auth?: firebase.auth.Auth;
    private patchExistingUser?(user: Doc<T, K>): Promise<Doc<T, K>>;
    private onSignOut?(): void;

    constructor(
        {
            firestore,
            auth,
        }: {
            firestore: firebase.firestore.Firestore,
            auth?: firebase.auth.Auth,
        },
        storeOptions: StoreOptions<T, K>,
        {
            patchExistingUser,
            onSignOut,
        }: {
            patchExistingUser?(user: Doc<T, K>): Promise<Doc<T, K>>;
            onSignOut?(): void;
        } = {},
    ) {
        super(
            { ...storeOptions },
            {
                firestore,
            }
        );

        this.auth = auth;
        this.patchExistingUser = patchExistingUser;
        this.onSignOut = onSignOut;

        this.auth && this.auth.onAuthStateChanged(this.setUser.bind(this));
    }

    @action
    public setUser(fbUser: firebase.User | null): void {
        if (!fbUser) {
            transaction(() => {
                this.isAuthInitialised = true;
                this._authUser.set(undefined);
            });

            if (this.onSignOut) {
                this.onSignOut();
            }
        } else {
            this.getAuthenticatedUserAsync(fbUser)
                .then(
                    (user) => {
                        this.getAuthUserSuccess(user);
                    },
                    async () => {
                        const authStoreUser = {
                            authDisplayName: fbUser.displayName || undefined,
                            authEmail: fbUser.email || undefined,
                            authUid: fbUser.uid,
                        } as Partial<T>;
                        const newDocument = await this.createNewDocument(authStoreUser);

                        this.addDocument(
                            newDocument as T,
                            fbUser.uid
                        ).then(
                            (userId) => {
                                // get the newly registered user
                                return this.collection.getAsync(userId)
                                    .then(
                                        (user) => this.getAuthUserSuccess(user),
                                        this.getUserError,
                                    );
                            },
                            (error) => console.log(`${error}\nCoudn't save newly registered user. `),
                        );
                    });
        }
    }

    private getAuthenticatedUserAsync(fbUser: firebase.User): Promise<Doc<T> | undefined> {
        return this.collection.getAsync(fbUser.uid)
            .then((userDoc) => {
                return this.patchExistingUser
                    ? this.patchExistingUser(userDoc)
                    : userDoc;
            });
    }

    @action.bound
    getAuthUserSuccess = (authUser: Doc<T> | undefined) => {
        transaction(() => {
            this.isAuthInitialised = true;
            this._authUser.set(authUser);
        });
    }

    @action.bound
    getUserError = (error: any) => {
        console.error(error);
    }

    public signout(): void {
        this.auth && this.auth.signOut();
    }

    public getLoggedInUserAsync() {
        return this.auth
            ? getLoggedInUserAsync(this.auth)
            : Promise.reject(new Error("Firebase auth not initialized"));
    }

    public dispose() {
        this.collection.dispose();
    }
}