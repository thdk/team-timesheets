import { IFavoriteRegistration } from "../../../../common";
import { TestCollection } from "./collection";
import { convertFavoriteRegistration } from "../../../../common/serialization/serializer";

export class FavoriteCollection extends TestCollection<IFavoriteRegistration> {
    constructor(
        db: firebase.firestore.Firestore,
        ref: firebase.firestore.CollectionReference,
    ) {
        super(
            db,
            ref,
            {
                serialize: convertFavoriteRegistration
            },
        );
    }
}
