import React from "react";
import { IUser } from "../../../../common/dist";
import { observer } from "mobx-react-lite";
import { StoreContext } from "../../../contexts/store-context";

export interface IWithUsersProps {
    users: (IUser & { id: string })[];
}

export type Props = IWithUsersProps;

export function withUsers<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithUsers = (props: Optionalize<T, IWithUsersProps>) => {
        const store = React.useContext(StoreContext);

        return store.user.usersCollection.isFetched
            ? <WrappedComponent
                users={store.user.usersCollection.docs.map(doc => ({ ...doc.data!, id: doc.id }))}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithUsers);
}

export default withUsers;