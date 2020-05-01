import * as React from 'react'
import { IUser } from "../../../../common/dist";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../contexts/store-context";

export interface IWithUsersProps {
    users: (IUser & { id: string })[];
}

export type Props = IWithUsersProps;

export function withUsers<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithUsers = (props: Optionalize<T, IWithUsersProps>) => {
        const store = useStore();

        return store.user.usersCollection.isFetched
            ? <WrappedComponent
                users={store.user.users}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithUsers);
}

export default withUsers;