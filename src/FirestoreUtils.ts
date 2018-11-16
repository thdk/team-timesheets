export function typeSnapshot<T extends firebase.firestore.DocumentData>(snapshot: firebase.firestore.QueryDocumentSnapshot): T;
export function typeSnapshot<T extends firebase.firestore.DocumentData>(snapshot: firebase.firestore.DocumentSnapshot): T | undefined;
export function typeSnapshot<T extends firebase.firestore.DocumentData>(snapshot: firebase.firestore.DocumentSnapshot | firebase.firestore.QueryDocumentSnapshot): T | undefined {
    const docData = snapshot.data();
    if (docData === undefined) return undefined;
    else return Object.assign<Pick<T, "id">, Exclude<T, "id">>({ id: snapshot.id }, docData as Exclude<T, "id">);
}

export const updateAsync = <T extends firebase.firestore.UpdateData>(collectionRef: firebase.firestore.CollectionReference, data: Partial<T> & Pick<T, "id">) => {
    return collectionRef
        .doc(data.id)
        .update(data);
}