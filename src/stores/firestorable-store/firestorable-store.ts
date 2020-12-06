import { observable, action, transaction, computed, reaction } from "mobx";
import { Collection, ICollectionOptions, ICollectionDependencies, Doc } from "firestorable";
import type firebase from "firebase";

export interface StoreOptions<T, K> {
    collection: string,
    collectionDependencies?: ICollectionDependencies,
    collectionOptions?: ICollectionOptions<T, K>,
    createNewDocumentDefaults?(overrideDefaultsWith?: Partial<T>): Partial<T> | Promise<Partial<T>>,
};

export class FirestorableStore<T, K> {
    @observable.ref
    private activeDocumentIdField: string | undefined = undefined;

    @observable.ref
    private activeDocumentField: Doc<T, K> | undefined = undefined;

    public readonly collection: Collection<T, K>;

    private newDocumentField = observable.box<Partial<T> | undefined>();
    private createNewDocumentDefaults?(): Partial<T> | Promise<Partial<T>>;

    private disposeFns: (() => void)[];

    constructor(
        {
            collection,
            collectionDependencies,
            collectionOptions,
            createNewDocumentDefaults,
        }: StoreOptions<T, K>,
        {
            firestore
        }: {
            firestore: firebase.firestore.Firestore,
        }
    ) {
        this.createNewDocumentDefaults = createNewDocumentDefaults;

        this.collection = new Collection<T, K>(
            firestore,
            collection,
            collectionOptions,
            collectionDependencies,
        );

        this.disposeFns = [
            reaction(
                () => this.activeDocumentIdField,
                (id) => {
                    if (!id) {
                        this.newDocumentField.set(undefined);

                    } else {
                        this.activeDocumentField = this.collection.get(id);
                        if (!this.activeDocumentField) {
                            // fetch the registration manually
                            this.collection.getAsync(id)
                                .then(regDoc => this.activeDocumentField = regDoc);
                        }
                    }
                },
            ),
            reaction(() => this.activeDocumentId, (id) => {
                if (!id) {
                    this.activeDocumentField = undefined;
                }
            }),
        ];
    }

    public deleteDocuments(
        {
            useFlag = true,
        }: {
            useFlag?: boolean,
        } = {},
        ...ids: string[]
    ) {
        if (!ids.length) {
            return Promise.resolve();
        }

        const promise: Promise<void | void[]> = useFlag
            ? this.collection.updateAsync(null, ...ids)
            : this.collection.deleteAsync(...ids);

        return promise.catch(e => {
            console.error(e);
            return [];
        });
    }

    public addDocument(document: T, id?: string) {
        return this.collection.addAsync(document, id);
    }

    public addDocuments(documents: T[]) {
        return this.collection.addAsync(documents);
    }

    public updateDocument(document: Partial<T>, id: string) {
        return this.collection.updateAsync(document, id);
    }

    @action
    public setActiveDocumentId(id?: string) {
        this.activeDocumentIdField = id;
    }

    @action
    public async createNewDocument(document?: Partial<T>) {
        const defaultData: Partial<T> = this.createNewDocumentDefaults
            ? await this.createNewDocumentDefaults()
            : {};

        const newDocument = { ...defaultData, ...document };
        transaction(() => {
            this.newDocumentField.set(newDocument);
            this.activeDocumentIdField = undefined;
        });

        return newDocument;
    }

    @computed
    public get activeDocument() {
        if (this.activeDocumentField) {
            return this.activeDocumentField.data;
        }
        return this.newDocumentField.get();
    }

    @computed
    public get activeDocumentId() {
        return this.activeDocumentIdField;
    }

    public updateActiveDocument(document: Partial<T>) {
        if (this.activeDocumentId) {
            this.updateDocument(
                document,
                this.activeDocumentId,
            );
        } else {
            throw new Error("Can't update active document. No active document set.");
        }
    }

    public dispose() {
        this.collection.dispose();
        this.disposeFns.reverse().forEach(fn => fn());
    }
}