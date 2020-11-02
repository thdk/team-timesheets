import { observable, action, transaction, computed, reaction } from "mobx";
import { Collection, ICollectionOptions, ICollectionDependencies } from "firestorable";


export class FirestorableStore<T, K> {
    @observable.ref
    private activeDocumentId: string | undefined = undefined;

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
            () => this.activeDocumentId,
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

    public addDocuments(document: T, id?: string) {
        this.collection.addAsync(document, id);
    }

    public updateDocument(document: Partial<T>, id: string) {
        this.collection.updateAsync(document, id);
    }

    @action
    public setActiveDocumentId(id?: string) {
        this.activeDocumentId = id;
    }

    @action
    public createNewDocument(document?: Partial<T>) {
        const defaultData: Partial<T> = this.createNewDocumentDefaults
            ? this.createNewDocumentDefaults()
            : {};

        transaction(() => {
            this.newDocument.set({ ...defaultData, ...document });
            this.activeDocumentId = undefined;
        });
    }

    @computed
    public get activeDocument() {
        if (this.activeDocumentId) {
            const doc = this.collection.get(this.activeDocumentId);
            return doc ? doc.data : undefined;
        } else {
            return this.newDocument.get();
        }
    }
}