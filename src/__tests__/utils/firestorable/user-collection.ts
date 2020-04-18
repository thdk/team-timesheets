import { IUserData } from "../../../../common";
import { TestCollection } from "./collection";

export class UserCollection extends TestCollection<IUserData> {
    constructor(
        db: firebase.firestore.Firestore,
        ref: firebase.firestore.CollectionReference,
    ) {
        super(
            db,
            ref,
        );
    }
}
