import { query, collection, getFirestore } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useFirebase } from "../../../contexts/firebase-context";

export function useJiraQueries() {
    const f = useFirebase();

    const [values] = useCollectionData(
        query(
            collection(getFirestore(f), "user-jira-queries")
        ),
    );

    return values;
}
