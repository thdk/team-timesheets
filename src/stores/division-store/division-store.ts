import { Collection, ICollection, RealtimeMode, FetchMode, Doc, CrudStore } from "firestorable";
import { observable, reaction, computed, autorun, makeObservable } from "mobx";

import { IRootStore } from '../root-store';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { IDivision, IDivisionCode } from "../../../common/interfaces/IOrganisation";
import { IDivisionData } from "../../../common/interfaces/IOrganisationData";
import { IUserData, IUser } from "../../../common";
import { CollectionReference, Firestore, query, where } from "firebase/firestore";
import { HttpsCallable } from "firebase/functions";

export class DivisionStore extends CrudStore<IDivision, IDivisionData> {
    readonly divisionCodesCollection: ICollection<IDivisionCode>;

    division: Doc<IDivision> | null = null;

    private readonly httpsCallable?: (name: string) => HttpsCallable<string, string >;

    private disposables: (() => void)[] = [];

    private rootStore: IRootStore;
    constructor(
        rootStore: IRootStore,
        {
            firestore,
            httpsCallable,
        }: {
            firestore: Firestore,
            httpsCallable?: (name: string) => HttpsCallable<string, string>,
        }
    ) {
        super(
            {
                collection: "divisions",
                collectionOptions: {
                    realtimeMode: RealtimeMode.on,
                    fetchMode: FetchMode.manual,
                    serialize: serializer.convertDivision,
                    deserialize: deserializer.convertDivision,
                },
            },
            {
                firestore,
            },
        );

        makeObservable(this, {
            division: observable.ref,
            divisionId: computed,
            userDivisions: computed
        });

        this.httpsCallable = httpsCallable

        this.rootStore = rootStore;

        const createQuery = (ref: CollectionReference<IDivisionData>, docs: Doc<IUser, IUserData>[]) => {
            if (docs.length) {
                const ids = docs
                    .reduce((p, c) => {
                        if (c.data!.divisionId) {
                            p.push(c.data!.divisionId);
                        }
                        return p;
                    }, [] as string[]);

                return query(ref, where(
                    "id",
                    "in",
                    ids.slice(0, ids.length < 10 ? ids.length : 10)
                ),
                );
            }
            return ref;
        };

        this.divisionCodesCollection = new Collection<IDivisionCode>(
            firestore,
            "division-codes",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
            },
            {
                // logger: console.log,
            },
        );

        this.disposables.push(
            reaction(() => this.rootStore.user.divisionUsersCollection.docs, (docs) => {
                this.collection.query = (ref) => createQuery(ref, docs);
                if (!this.collection.isFetched) {
                    this.collection.fetchAsync();
                }
            })
        );

        this.disposables.push(
            autorun(() => {
                const division = this.divisionId ? this.collection.get(this.divisionId) : null;

                this.division = division || null;
            })
        );
    }

    get divisionId() {
        return this.rootStore.user.divisionUser?.divisionId;
    }

    public get userDivisions() {

        return this.rootStore.user.divisionUsersCollection.docs
            .reduce((p, c) => {
                const orgId = c.data!.divisionId;
                if (orgId) {
                    const org = this.collection.get(orgId);
                    if (org) {
                        p.push({
                            ...org.data!,
                            divisionUserId: c.id,
                        });
                    }
                }
                return p;
            }, [] as (IDivision & { divisionUserId: string })[]);
    }

    public joinDivision(code: string) {
        if (!this.httpsCallable) {
            throw new Error("DivisionStore needs to be provided with httpsCallable in constructor");
        }

        return this.httpsCallable("getDivisionByEntryCode")(code)
            .then(
                ({ data: divisionId }) => {
                    if (!divisionId) {
                        return Promise.reject(
                            new Error("unknown-division"),
                        );
                    }

                    if (this.userDivisions.some(data => data.id === divisionId)
                    ) {
                        return Promise.reject(
                            new Error("already-in-division"),
                        )
                    }

                    if (!this.rootStore.user.authenticatedUser) {
                        return Promise.reject(new Error("unauthenticated"));
                    }

                    return this.rootStore.user.divisionUsersCollection.addAsync(
                        {
                            ...this.rootStore.user.authenticatedUser,
                            divisionId,
                            roles: {
                                user: true
                            },
                        },
                    ).then(
                        (divisionUserId) => {
                            return this.rootStore.auth.updateActiveDocument({
                                divisionUserId,
                                divisionId,
                            });
                        },
                    )
                },
                e => {
                    console.error(e);
                    throw e;
                },
            )
            .then(
                () => {
                    return "Successfully joined this division";
                }, (e: Error) => {
                    let title: string;
                    switch (e.message) {
                        case "already-in-division":
                            title = "You are already in this division";
                            break;
                        case "unknown-division":
                            title = "You can't join this division";
                            break;
                        default:
                            return Promise.reject(e);
                    }
                    return Promise.reject(title);
                },
            );
    }

    public dispose() {
        this.disposables.reverse().forEach((d) => d());
    }
}
