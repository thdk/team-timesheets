import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IAuthenticatedUser } from '../../../../common/dist';
import store from '../../../stores/root-store';

export interface IWithAuthenticatedUserProps {
    authenticatedUser: IAuthenticatedUser;
}

export const withAuthenticatedUser = (
    WrappedComponent: React.ComponentType<IWithAuthenticatedUserProps>,
) => {
    const WithAuthenticatedUserProps = () => {

        if (!store.user.authenticatedUser) {
            throw new Error("Authenticated user is undefined. (Wrap in withAuthenticatedUser?)");
        }

        return <WrappedComponent authenticatedUser={store.user.authenticatedUser}/>;
    };

    return observer(WithAuthenticatedUserProps);
};
