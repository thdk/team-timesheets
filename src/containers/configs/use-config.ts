import { doc, getDoc, getFirestore } from "firebase/firestore"
import { useQuery } from "react-query";
import { useFirebase } from "../../contexts/firebase-context"

export const useConfig = (key: string) => {
    const firebase = useFirebase();

    const configQueryResult = useQuery(
        [
            "config",
            key,
        ],
        () => getDoc(
            doc(getFirestore(firebase), `configs/${key}`)
        ).catch(() => {
            return null;
        }),
        {
            select: doc => doc?.data()?.value || null
        }
    );

    return configQueryResult.isLoading
        ? undefined
        : configQueryResult.data as string | null;
}

