import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IAuthenticatedUser } from '../../../../common/dist';
import { useUserStore } from '../../../stores/user-store';

export interface IWithAuthenticatedUserProps {
    authenticatedUser: IAuthenticatedUser;
}

export const withAuthenticatedUser = (
    WrappedComponent: React.ComponentType<IWithAuthenticatedUserProps>,
) => {
    const WithAuthenticatedUserProps = () => {
        const user = useUserStore();

        if (!user.authenticatedUser) {
            throw new Error("Authenticated user is undefined. (Wrap in withAuthenticatedUser?)");
        }

        return <WrappedComponent authenticatedUser={user.authenticatedUser}/>;
    };

    return observer(WithAuthenticatedUserProps);
};
