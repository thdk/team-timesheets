import React from "react";
import store from "../../../stores/root-store";
import { IUser } from "../../../../common/dist";
import { observer } from "mobx-react-lite";

export interface IWithUsersProps {
    users: (IUser & { id: string })[];
}

export type Props = IWithUsersProps;

export function withUsers<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithUsers = (props: Optionalize<T, IWithUsersProps>) => {
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