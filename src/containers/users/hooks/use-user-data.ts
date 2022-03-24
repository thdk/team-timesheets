import { doc, getFirestore } from "firebase/firestore";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useFirebase } from "../../../contexts/firebase-context";

export function useUserData(userId?: string) {
    const firebase = useFirebase();

    const [divisionUserData, isLoading] = useDocumentDataOnce(
        userId 
        ? doc(getFirestore(firebase), `division-users/${userId}`)
        : null
    );

    // fallback to the user collection
    const [userData] = useDocumentDataOnce(
        userId && !divisionUserData && !isLoading
        ? doc(getFirestore(firebase), `users/${userId}`)
        : null
    );

    return divisionUserData || userData;
}