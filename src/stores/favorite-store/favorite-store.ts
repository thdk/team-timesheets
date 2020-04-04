import { ICollection, Collection, FetchMode, RealtimeMode, Doc } from "firestorable";
import { observable, reaction, computed, action } from "mobx";
import firebase from "firebase/app";
import "firebase/firestore";
import { CollectionReference } from "@firebase/firestore-types";

import { IRootStore } from "../root-store";
import { IFavoriteRegistrationGroup, IFavoriteRegistration, IFavoriteRegistrationGroupData } from "../../../common/dist";
import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';

export class FavoriteStore {
    public favoriteGroupCollection: ICollection<IFavoriteRegistrationGroup, IFavoriteRegistrationGroupData>;
    public favoriteCollection: ICollection<IFavoriteRegistration>;

    private favoriteGroupCollectionRef: CollectionReference;
    private db: firebase.firestore.Firestore;

    @observable.ref
    private activefavoriteGroupIdField: string | undefined;
    private readonly rootStore: IRootStore;

    constructor(rootStore: IRootStore) {
        this.rootStore = rootStore;
        this.db = firebase.firestore();
        this.favoriteGroupCollectionRef = this.db.collection("favorite-groups");
        const createQuery = () =>
            rootStore.user.authenticatedUser
                ? (ref: CollectionReference) => ref.where("userId", "==", rootStore.user.userId).orderBy("name")
                : null;

        this.favoriteGroupCollection = new Collection(
            this.db,
            this.favoriteGroupCollectionRef,
            {
                fetchMode: FetchMode.once,
                name: "Favorite groups",
                query: createQuery(),
            },
            {
                logger: console.log
            },
        );

        this.favoriteCollection = new Collection(
            this.db,
            "favorites",
            {
                fetchMode: FetchMode.once,
                realtimeMode: RealtimeMode.on,
                serialize: serializer.convertFavoriteRegistration,
                deserialize: deserializer.convertFavoriteRegistration,
            },
            {
                logger: console.log
            },
        )

        reaction(() => rootStore.user.userId, () => {
            this.favoriteGroupCollection.query = createQuery();
        });
    }

    @computed
    public get activeFavoriteGroup() {
        if (!this.activefavoriteGroupIdField) {
            return undefined;
        }

        const doc = this.favoriteGroupCollection.get(this.activefavoriteGroupIdField);
        return doc && doc.data
            ? doc
            : undefined;
    }

    @computed
    public get groups() {
        return this.favoriteGroupCollection.docs
            .reduce((data, doc) => {
                if (doc.data) {
                    data.push({
                        name: "Default",
                        ...doc.data!,
                        id: doc.id,
                    });
                }

                return data;
            },
                [] as ({ id: string } & IFavoriteRegistrationGroup)[]
            );
    }

    @computed
    public get favorites() {
        return this.favoriteCollection.docs.reduce((p, c) => {
            const { groupId = undefined } = c.data || {};
            p.set(groupId, [...(p.get(groupId) || []), c]);
            return p;
        }, new Map<string | undefined, Doc<IFavoriteRegistration>[]>());
    }

    @computed
    public get favoritesByGroup() {
        return (id: string) => this.favorites.get(id) || [];
    }

    @action
    public setActiveFavoriteGroupId(id: string | undefined) {
        this.activefavoriteGroupIdField = id;
    }

    public addFavorites(favorites: Omit<IFavoriteRegistration, "groupId">[], group: { name: string, id?: string }) {
        const groupId = group.id
            ? group.id
            : this.favoriteGroupCollectionRef.doc().id;

        this.db.runTransaction(() => {
            if (!this.rootStore.user.userId)
                return Promise.reject("Unauthenticated");

            return Promise.all<string[] | string | undefined>([
                group.id
                    ? undefined
                    : this.favoriteGroupCollection.addAsync({
                        name: group.name,
                        userId: this.rootStore.user.userId
                    }, groupId),
                this.favoriteCollection.addAsync(
                    favorites
                        .map(f => ({ ...f, groupId: groupId }))
                ),
            ]);
        });

        return groupId;
    }

    public deleteGroups(...ids: string[]) {
        this.favoriteGroupCollection.deleteAsync(...ids);
    }

    public updateActiveFavoriteGroup() {
        this.activefavoriteGroupIdField && this.activeFavoriteGroup &&
            this.favoriteGroupCollection.updateAsync(this.activeFavoriteGroup.data!, this.activefavoriteGroupIdField);
    }

    public deleteActiveFavoriteGroup() {
        this.activefavoriteGroupIdField && this.favoriteGroupCollection.deleteAsync(this.activefavoriteGroupIdField);
    }
}
