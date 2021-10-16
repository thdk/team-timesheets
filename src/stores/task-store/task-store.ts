import { RealtimeMode, FetchMode, CrudStore } from "firestorable";
import { reaction, computed, makeObservable } from "mobx";

import { IRootStore } from '../root-store';
import { ITask, ITaskData } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { collection, CollectionReference, Firestore, orderBy, query, where } from "firebase/firestore";

export class TaskStore extends CrudStore<ITask, ITaskData> {
    private readonly rootStore: IRootStore;

    private disposables: (() => void)[] = [];
    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: Firestore,
        }
    ) {
        super(
            {
                collection: collection(firestore, "tasks") as CollectionReference<ITaskData>,
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

        makeObservable(this, {
            tasks: computed
        });

        this.rootStore = rootStore;

        this.disposables.push(
            reaction(() => rootStore.user.divisionUser, (user) => {
                if (!user) {
                    this.collection.query = null;
                }
                else {
                    const q = (ref: CollectionReference<ITaskData>) =>
                        query(
                            ref,
                            orderBy("name_insensitive"),
                            where("divisionId", "==", user.divisionId || ""),
                        );

                    this.collection.query = q;

                    if (!this.collection.isFetched) {
                        this.collection.fetchAsync();
                    }
                }
            })
        );
    }

    public get tasks() {
        return Array.from(this.collection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }));
    }

    public dispose() {
        super.dispose();
        this.disposables.reverse().forEach(d => d());
    }
}