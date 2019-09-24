import * as admin from "firebase-admin";

export const initTimestamps = (db: FirebaseFirestore.Firestore) => {
    const collections = ["projects", "registrations", "users"];
    return Promise.all(collections.map(c => {
        return db.collection(c).get().then(snapshot => {
            const updates: { ref: FirebaseFirestore.DocumentReference, data: any }[] = snapshot.docs.reduce((p, doc) => {
                const data = doc.data();
                let shouldUpdate = false;

                const newData = {};
                if (!data.created) {
                    Object.assign(newData, { created: admin.firestore.FieldValue.serverTimestamp() });
                    console.log("Missing date created: " + doc.id);
                    shouldUpdate = true;
                }

                if (!data.modified) {
                    Object.assign(newData, { modified: admin.firestore.FieldValue.serverTimestamp() });
                    shouldUpdate = true;
                    console.log("Missing date modified: " + doc.id);
                }

                if (shouldUpdate) {
                    p.push({ ref: doc.ref, data: newData });
                }

                return p;

            }, [] as { ref: FirebaseFirestore.DocumentReference, data: any }[]);

            let i: number;
            let temparray: { ref: FirebaseFirestore.DocumentReference, data: any }[];
            const chunk = 500; // max 500 records in a batch

            const j = updates.length;
            console.log("Updates: " + j.toString());
            const results = [];
            for (i = 0; i < j; i += chunk) {
                temparray = updates.slice(i, i + chunk);
                const batch = db.batch();
                temparray.forEach(update => {
                    console.log(`updating: ${update.data}`);
                    batch.update(update.ref, update.data);
                });

                results.push(batch.commit());
            }

            return Promise.all(results);
        });
    }));
};

export interface IChangeProjectOfRegistrationsOptions { from: string, to: string };

export const changeProjectOfRegistrations = (db: FirebaseFirestore.Firestore, { from, to }: IChangeProjectOfRegistrationsOptions): Promise<string> => {
    if (!from) throw new Error("Missing required option 'from'");
    if (!to) throw new Error("Missing required options: 'to'");
    const query = db.collection("registrations").where("project", "==", from);

    return query.limit(500).get().then(snapshot => {
        if (snapshot.empty) return new Promise<string>(resolve => resolve(`No registrations found with projectId: ${from}`));

        const batch = db.batch();
        snapshot.forEach(doc => batch.update(doc.ref, { project: to, modified: admin.firestore.FieldValue.serverTimestamp() }));

        return batch.commit().then(() => query.get().then(finalSnapshot => `${snapshot.size} registrations updated.\n ${finalSnapshot.size} remaining.`));
    });
};

export const projectsAll = (db: FirebaseFirestore.Firestore) => {
    return db.collection("projects").orderBy("name_insensitive").get().then(snapshot => {
        return snapshot.size === 0
            ? new Promise<any[]>(resolve => resolve([]))
            : snapshot.docs.map(doc => {
                return { id: doc.id, name: doc.data().name };
            });
    })
};

export const projectsByName = (db: FirebaseFirestore.Firestore, name: string) => {
    if (!name) throw new Error("Missing required option 'from'");

    return db.collection("projects").where("name_insensitive", "==", name.toUpperCase()).get().then(snapshot => {
        return snapshot.size === 0
            ? new Promise<any[]>(resolve => resolve([]))
            : Promise.all(snapshot.docs
                .map(doc => db.collection("registrations").where("project", "==", doc.id).get()
                    .then(registrationsSnapshot => {
                        const counter = registrationsSnapshot.size === 0 ? 0 : registrationsSnapshot.docs.filter(r => !r.data().deleted).length;
                        return { id: doc.id, name: doc.data().name, registrationCount: counter };
                    })
                )
            )
    })
};

export const initNamesInsensitive = (db: FirebaseFirestore.Firestore) => {
    const collections = ["clients", "projects", "tasks", "teams"];
    return Promise.all(collections.map(c => {
        const collectionRef = db.collection(c);
        return collectionRef.get().then(snapshot => {
            const updates: { ref: FirebaseFirestore.DocumentReference, data: any }[] = snapshot.docs.reduce((p, doc) => {
                const data = doc.data();
                let shouldUpdate = false;

                const newData = {};
                if (!data.name_insensitive && data.name) {
                    Object.assign(newData, { name_insensitive: (data.name || "").toUpperCase() });
                    console.log("updated: " + doc.id + " " + data.name + "-" + (data.name || "").toUpperCase());
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    p.push({ ref: doc.ref, data: newData });
                }

                return p;

            }, [] as { ref: FirebaseFirestore.DocumentReference, data: any }[]);

            let i: number;
            let temparray: { ref: FirebaseFirestore.DocumentReference, data: any }[];
            const chunk = 500; // max 500 records in a batch

            const j = updates.length;
            console.log("Updates: " + j.toString());
            const results = [] as Promise<admin.firestore.WriteResult[]>[];
            for (i = 0; i < j; i += chunk) {
                temparray = updates.slice(i, i + chunk);
                const batch = db.batch();
                temparray.forEach(update => {
                    console.log(`updating: ${update.data}`);
                    batch.update(update.ref, update.data);
                });

                results.push(batch.commit());
            }

            return Promise.all(results);

        });
    }));
};