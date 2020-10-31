import { Collection, ICollection, RealtimeMode, FetchMode, Doc } from "firestorable";
import { observable, reaction, computed, autorun } from "mobx";

import { IRootStore } from '../root-store';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { IDivision, IDivisionCode } from "../../../common/interfaces/IOrganisation";
import { IDivisionData } from "../../../common/interfaces/IOrganisationData";
import { firestore } from "firebase";
import { IUserData, IUser } from "../../../common";
import firebase from "firebase/app";

export class DivisionStore {
    readonly divisionCollection: ICollection<IDivision, IDivisionData>;
    readonly divisionCodesCollection: ICollection<IDivisionCode>;

    @observable.ref projectId?: string;
    @observable.ref division: Doc<IDivision> | undefined;

    private rootStore: IRootStore;
    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: firebase.firestore.Firestore,
        }
    ) {

        this.rootStore = rootStore;

        const createQuery = (ref: firestore.CollectionReference, docs: Doc<IUser, IUserData>[]) => {
            if (docs.length) {
                const ids = docs
                    .reduce((p, c) => {
                        if (c.data!.divisionId) {
                            p.push(c.data!.divisionId);
                        }
                        return p;
                    }, [] as string[]);

                return ref.where(
                    "id",
                    "in",
                    ids,
                );
            }
            return ref;
        };

        this.divisionCollection = new Collection<IDivision, IDivisionData>(
            firestore,
            "divisions",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
                serialize: serializer.convertOrganisation,
                deserialize: deserializer.convertOrganisation,
            },
            {
                // logger: console.log,
            },
        );

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

        reaction(() => this.rootStore.user.divisionUsersCollection.docs, (docs) => {
            this.divisionCollection.query = (ref) => createQuery(ref, docs);
            if (!this.divisionCollection.isFetched) {
                this.divisionCollection.fetchAsync();
            }
        });

        autorun(() => {
            const division = this.divisionId ? this.divisionCollection.get(this.divisionId) : undefined;

            this.division = division;
        });
    }

    @computed get divisionId() {
        return this.rootStore.user.divisionUser?.divisionId;
    }

    @computed
    public get userDivisions() {

        return this.rootStore.user.divisionUsersCollection.docs
            .reduce((p, c) => {
                const orgId = c.data!.divisionId;
                if (orgId) {
                    const org = this.divisionCollection.get(orgId);
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

    public joinDivision(code: string, callback: (message: string) => void) {
        return firebase.functions().httpsCallable("getDivisionByEntryCode")(code)
            .then(({ data: divisionId }) => {
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

                return this.rootStore.user.divisionUsersCollection.addAsync(
                    {
                        ...this.rootStore.user.authenticatedUser!,
                        divisionId,
                        roles: {
                            user: true
                        },
                    },
                ).then(
                    (divisionUserId) => {
                        return this.rootStore.user.updateAuthenticatedUser({
                            divisionUserId,
                            divisionId,
                        });
                    },
                )
            })
            .then(
                () => {
                    callback(`Successfully joined this division`);
                }, (e: Error) => {
                    let title: string;
                    switch (e.message) {
                        case "already-in-division":
                            title = "You are already in this division";
                            break;

                        default:
                            title = "You can't join this division";
                            break;
                    }
                    callback(title);
                },
            );
    }
}
