import { query, collection, getFirestore, CollectionReference } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useFirebase } from "../../../contexts/firebase-context";

export type JiraQuery = {
    jql: string;
    taskId: string;
};

export function useJiraQueries() {
    const f = useFirebase();

    const [values] = useCollection(
        query<JiraQuery>(
            collection(getFirestore(f), "user-jira-queries") as CollectionReference<JiraQuery>
        ),
    );

    return values?.docs.map((doc) => ({ ...doc.data(), id: doc.id })) || [];
}
