import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useUserStore } from "../../../contexts/user-context";
import { IUser } from '../../../../common';

export interface IWithAuthenticatedUserProps {
    authenticatedUser: IUser;
}

export const withAuthenticatedUser = (
    WrappedComponent: React.ComponentType<IWithAuthenticatedUserProps>,
) => {
    const WithAuthenticatedUserProps = () => {
        const user = useUserStore();

        if (!user.divisionUser) {
            throw new Error("Authenticated user is undefined. (Wrap in withAuthenticatedUser?)");
        }

        return <WrappedComponent authenticatedUser={user.divisionUser}/>;
    };

    return observer(WithAuthenticatedUserProps);
};
