import * as admin from "firebase-admin";

export const initTimestampsForRegistrations = (db: FirebaseFirestore.Firestore) => {
    const collections = ["projects", "registrations"];
    return Promise.all(collections.reduce((previousPromises, c) => {
        const collectionRef = db.collection(c);
        collectionRef.get().then(snapshot => {
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
        return previousPromises;
    }, []));
};

export const initNamesInsensitive = (db: FirebaseFirestore.Firestore) => {
    const collections = ["clients", "projects", "tasks", "teams"];
    return Promise.all(collections.reduce((previousPromises, c) => {
        const collectionRef = db.collection(c);
        collectionRef.get().then(snapshot => {
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
        return previousPromises;
    }, []));
};