export type FirestoreData<T> = (Exclude<T, "id"> & { id?: string });
export function addAsync<T extends { id?: string }>(firestore: FirebaseFirestore.Firestore, collectionRef: FirebaseFirestore.CollectionReference, data: FirestoreData<T[]>): Promise<void>;
export function addAsync<T extends { id?: string }>(firestore: FirebaseFirestore.Firestore, collectionRef: FirebaseFirestore.CollectionReference, data: FirestoreData<T>): Promise<string>;
export function addAsync<T extends { id?: string }>(firestore: FirebaseFirestore.Firestore, collectionRef: FirebaseFirestore.CollectionReference, data: FirestoreData<T> | FirestoreData<T>[]): Promise<void | string> {
    if (Array.isArray(data)) {
        return batchProcess(
            data,
            (batch, item) => {
                const docRef = item.id ? collectionRef.doc(item.id) : collectionRef.doc();
                delete item.id;
                return batch.set(docRef, item);
            },
            500,
            firestore).then(() => {
                //
            });
    }
    else {
        const { id } = data;
        const docRef = id ? collectionRef.doc(id) : collectionRef.doc();
        return docRef.set(data).then(() => docRef.id);
    }
};

export function batchProcess<T>(data: T[], func: (batch: Omit<FirebaseFirestore.WriteBatch, "create" | "commit">, data: T) => FirebaseFirestore.WriteBatch, batchSize = 500, fireStoreDb: FirebaseFirestore.Firestore) {
    let i: number;
    let temparray: T[];
    const chunk = batchSize <= 500 ? batchSize : 500; // max 500 records in a batch

    const j = data.length;
    const results = [] as Promise<FirebaseFirestore.WriteResult[]>[];
    for (i = 0; i < j; i += chunk) {
        temparray = data.slice(i, i + chunk);
        const batch = fireStoreDb.batch();
        temparray.forEach(dataItem => {
            func(batch, dataItem);
        });

        results.push(batch.commit());
    }

    return Promise.all(results);
}