import React from "react";
import { observer } from "mobx-react-lite";
import { Collection, Doc } from "firestorable";

export interface IWithDocsProps<T> {
    docs: Doc<T>[];
}

export type Props<T> = IWithDocsProps<T>;

export function withDocs<K, T extends Props<K> = Props<K>>(
    collection: Collection<T>,
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithDocs = (props: Optionalize<T, IWithDocsProps<K>>) => {

        return collection.isFetched
            ? <WrappedComponent
                docs={collection.docs}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithDocs);
}

export default withDocs;
