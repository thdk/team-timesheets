import { Collection, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { observable, reaction, computed } from "mobx";

import { IRootStore } from '../root-store';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { IOrganisation } from "../../../common/interfaces/IOrganisation";
import { IOrganisationData } from "../../../common/interfaces/IOrganisationData";
import { firestore } from "firebase";

export class DivisionStore {
    readonly organisationsCollection: ICollection<IOrganisation, IOrganisationData>;

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

        this.organisationsCollection = new Collection<IOrganisation, IOrganisationData>(
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
            this.organisationsCollection.query = (ref) => createQuery(ref);
        });
    }

    @computed
    public get userDivisions() {

        return this.rootStore.user.divisionUsersCollection.docs.reduce((p, c) => {
            const orgId = c.data!.divisionId;
            if (orgId) {
                const org = this.organisationsCollection.get(orgId);
                if (org) {
                    p.push({ ...org.data!, id: org.id });
                }
            }
            return p;
        }, [] as (IOrganisation & { id: string })[]);
    }
}