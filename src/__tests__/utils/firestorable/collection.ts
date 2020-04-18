import { Collection, FetchMode, RealtimeMode, ICollectionOptions } from "firestorable";

export class TestCollection<T, K = T> extends Collection<T, K> {
    constructor(
        db: firebase.firestore.Firestore,
        name: firebase.firestore.CollectionReference,
        options?: ICollectionOptions<T, K>,
    ) {
        super(
            db,
            name,
            {
                fetchMode: FetchMode.manual,
                realtimeMode: RealtimeMode.off,
                ...options
            }
        );
    }
}