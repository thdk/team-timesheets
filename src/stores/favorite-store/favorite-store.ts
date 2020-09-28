import { ICollection, Collection, FetchMode, RealtimeMode } from "firestorable";
import { observable, reaction, computed, action } from "mobx";
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

    constructor(rootStore: IRootStore, {
        firestore,
    }: {
        firestore: firebase.firestore.Firestore,
    }) {
        this.rootStore = rootStore;
        this.db = firestore;
        this.favoriteGroupCollectionRef = this.db.collection("favorite-groups");
        const createQuery = () =>
            rootStore.user.divisionUser
                ? (ref: CollectionReference) => ref.where("userId", "==", rootStore.user.divisionUser?.id).orderBy("name")
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
                // logger: console.log
            },
        );

        this.favoriteCollection = new Collection(
            this.db,
            "favorites",
            {
                fetchMode: FetchMode.manual,
                realtimeMode: RealtimeMode.off,
                serialize: serializer.convertFavoriteRegistration,
                deserialize: deserializer.convertFavoriteRegistration,
            },
            {
                // logger: console.log
            },
        )

        reaction(() => rootStore.user.divisionUser, () => {
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

    public getFavoritesByGroupIdAsync(groupId: string) {

        this.favoriteCollection.query = collRef => collRef
            .where("groupId", "==", groupId);

        return this.favoriteCollection.fetchAsync()
            .then(() => {

                return this.favoriteCollection.docs
                    .sort((a, b) => {
                        // TODO: Use stable sort method
                        return (a.data!.description || "") > (b.data!.description || "")
                            ? 1
                            : -1;
                    });
            });
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
            if (!this.rootStore.user.divisionUser)
                return Promise.reject("Unauthenticated");

            return Promise.all<string[] | string | undefined>([
                group.id
                    ? undefined
                    : this.favoriteGroupCollection.addAsync({
                        name: group.name,
                        userId: this.rootStore.user.divisionUser.id
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
