import { RealtimeMode, FetchMode, CrudStore } from "firestorable";
import { reaction, computed } from "mobx";
import type firebase from "firebase";

import { IRootStore } from '../root-store';
import { ITask, ITaskData } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';

export class TaskStore extends CrudStore<ITask, ITaskData> {
    private readonly rootStore: IRootStore;

    private disposables: (() => void)[] = [];
    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: firebase.firestore.Firestore,
        }
    ) {
        super(
            {
                collection: "tasks",
                collectionOptions: {
                    realtimeMode: RealtimeMode.on,
                    fetchMode: FetchMode.manual,
                    serialize: serializer.convertTask,
                    deserialize: deserializer.convertTask,
                },
                createNewDocumentDefaults: () => ({
                    createdBy: this.rootStore.user.divisionUser?.id,
                    divisionId: this.rootStore.user.divisionUser?.divisionId,
                }),
            },
            {
                firestore,
            },
        );
        this.rootStore = rootStore;

        this.disposables.push(
            reaction(() => rootStore.user.divisionUser, (user) => {
                if (!user) {
                    this.collection.query = null;
                }
                else {
                    const query = (ref: firebase.firestore.CollectionReference) =>
                        ref.orderBy("name_insensitive")
                            .where("divisionId", "==", user.divisionId || "");

                    this.collection.query = query;

                    if (!this.collection.isFetched) {
                        this.collection.fetchAsync();
                    }
                }
            })
        );
    }

    @computed
    public get tasks() {
        return Array.from(this.collection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }));
    }

    public dispose() {
        super.dispose();
        this.disposables.reverse().forEach(d => d());
    }
}