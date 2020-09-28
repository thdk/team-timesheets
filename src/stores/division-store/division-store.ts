import { Collection, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { observable, reaction, computed } from "mobx";

import { IRootStore } from '../root-store';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { IDivision } from "../../../common/interfaces/IOrganisation";
import { IDivisionData } from "../../../common/interfaces/IOrganisationData";
import { firestore } from "firebase";

export class DivisionStore {
    readonly divisionCollection: ICollection<IDivision, IDivisionData>;

    @observable.ref projectId?: string;

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

        const createQuery = (ref: firestore.CollectionReference) => {
            if (this.rootStore.user.divisionUsersCollection.docs.length) {
                return ref.where("id", "in", this.rootStore.user.divisionUsersCollection.docs
                    .reduce((p, c) => {
                        if (c.data!.divisionId) {
                            p.push(c.data!.divisionId);
                        }
                        return p;
                    }, [] as string[]));
            }
            return ref;
        };

        this.divisionCollection = new Collection<IDivision, IDivisionData>(
            firestore,
            "divisions",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.auto,
                serialize: serializer.convertOrganisation,
                deserialize: deserializer.convertOrganisation,
            },
            {
                // logger: console.log,
            },
        );

        reaction(() => this.rootStore.user.divisionUsersCollection.docs, () => {
            this.divisionCollection.query = (ref) => createQuery(ref);
        });
    }

    @computed
    public get division() {
        return this.divisionId
            ? this.divisionCollection.get(this.divisionId)
            : undefined;
    }

    @computed get divisionId() {
        return this.rootStore.user.divisionUser?.divisionId;
    }

    @computed
    public get userDivisions() {

        return this.rootStore.user.divisionUsersCollection.docs.reduce((p, c) => {
            const orgId = c.data!.divisionId;
            if (orgId) {
                const org = this.divisionCollection.get(orgId);
                if (org) {
                    p.push({ ...org.data!, id: c.id });
                }
            }
            return p;
        }, [] as (IDivision & { id: string })[]);
    }
}