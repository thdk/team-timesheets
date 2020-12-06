import type firebase from "firebase";
import { action, transaction, observable } from "mobx";
import { Doc, Collection } from "firestorable";
import { FirestorableStore, StoreOptions } from "../firestorable-store";

export interface AuthStoreUser {
    name?: string;
    email?: string;
    uid: string;
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

    private auth?: firebase.auth.Auth;
    private patchExistingUser?(
        user: Doc<T, K>,
        collection: Collection<T, K>,
        fbUser: firebase.User,
    ): Promise<Doc<T, K>>;
    private onSignOut?(): void;

    constructor(
        {
            firestore,
            auth,
        }: {
            firestore: firebase.firestore.Firestore,
            auth?: firebase.auth.Auth,
        },
        storeOptions: StoreOptions<T, K> = {
            collection: "users",
        },
        {
            patchExistingUser,
            onSignOut,
        }: {
            patchExistingUser?(
                user: Doc<T, K>,
                collection: Collection<T, K>,
                fbUser: firebase.User,
            ): Promise<Doc<T, K>>;
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
    // todo: should be private (currently public for tests)
    public setUser(fbUser: firebase.User | null): void {
        if (!fbUser) {
            transaction(() => {
                this.isAuthInitialised = true;
                this.setActiveDocumentId(undefined);
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
                            name: fbUser.displayName || undefined,
                            email: fbUser.email || undefined,
                            uid: fbUser.uid,
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
                    ? this.patchExistingUser(
                        userDoc,
                        this.collection,
                        fbUser,
                    )
                    : userDoc;
            });
    }

    @action.bound
    private getAuthUserSuccess = (authUser: Doc<T> | undefined) => {
        transaction(() => {
            this.isAuthInitialised = true;
            this.setActiveDocumentId(authUser?.id);
        });
    }

    @action.bound
    private getUserError = (error: any) => {
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
