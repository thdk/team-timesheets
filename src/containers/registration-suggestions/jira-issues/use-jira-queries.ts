import { query, collection, getFirestore } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useFirebase } from "../../../contexts/firebase-context";

export function useJiraQueries() {
    const f = useFirebase();

    const [values, _loading, error ] = useCollectionData(
        query(
            collection(getFirestore(f), "user-jira-queries")
        ),
    );

    if (error) {
        console.error(error);
    }

    return values;
}
