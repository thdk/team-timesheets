import { observable, action, transaction, computed, reaction } from "mobx";
import { Collection, ICollectionOptions, ICollectionDependencies, Doc } from "firestorable";


export class FirestorableStore<T, K> {
    @observable.ref
    private activeDocumentIdField: string | undefined = undefined;

    @observable.ref
    private activeDocumentField: Doc<T, K> | undefined = undefined;

    public readonly collection: Collection<T, K>;

    private newDocument = observable.box<Partial<T> | undefined>();
    private createNewDocumentDefaults?(): Partial<T> | Promise<Partial<T>>;


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
            createNewDocumentDefaults?(overrideDefaultsWith?: Partial<T>): Partial<T> | Promise<Partial<T>>,
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

        // TODO: dispose reaction
        reaction(
            () => this.activeDocumentIdField,
            (id) => {
                if (!id) {
                    this.newDocument.set(undefined);

                } else {
                    this.activeDocumentField = this.collection.get(id);
                    if (!this.activeDocumentField) {
                        // fetch the registration manually
                        this.collection.getAsync(id)
                            .then(regDoc => this.activeDocumentField = regDoc);
                    }
                }
            },
        );
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

        transaction(() => {
            this.newDocument.set({ ...defaultData, ...document });
            this.activeDocumentIdField = undefined;
        });
    }

    @computed
    public get activeDocument() {
        if (this.activeDocumentField) {
           return this.activeDocumentField.data;
        } else {
            return this.newDocument.get();
        }
    }

    @computed
    public get activeDocumentId() {
        return this.activeDocumentIdField;
    }
}