import { observable, action, transaction, computed, reaction } from "mobx";
import { Collection, ICollectionOptions, ICollectionDependencies } from "firestorable";


export class FirestorableStore<T, K> {
    @observable.ref
    private activeDocumentIdField: string | undefined = undefined;

    public readonly collection: Collection<T, K>;

    private newDocument = observable.box<Partial<T> | undefined>();
    private createNewDocumentDefaults?(): Partial<T>;


    constructor(
        {
            collection,
            collectionDependencies,
            collectionOptions,
            createNewDocumentDefaults,
        }: {
            collection: string,
            collectionDependencies?: ICollectionDependencies,
            collectionOptions: ICollectionOptions<T, K>,
            createNewDocumentDefaults?(): Partial<T>,
        },
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

        reaction(
            () => this.activeDocumentIdField,
            (id) => {
                if (!id) {
                    this.newDocument.set(undefined);
                }
            },
        );
    }

    public deleteDocuments(...ids: string[]) {
        ids.length && this.collection.updateAsync(null, ...ids);
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
    public createNewDocument(document?: Partial<T>) {
        const defaultData: Partial<T> = this.createNewDocumentDefaults
            ? this.createNewDocumentDefaults()
            : {};

        transaction(() => {
            this.newDocument.set({ ...defaultData, ...document });
            this.activeDocumentIdField = undefined;
        });
    }

    @computed
    public get activeDocument() {
        if (this.activeDocumentIdField) {
            const doc = this.collection.get(this.activeDocumentIdField);
            return doc ? doc.data : undefined;
        } else {
            return this.newDocument.get();
        }
    }

    @computed
    public get activeDocumentId() {
        return this.activeDocumentIdField;
    }
}