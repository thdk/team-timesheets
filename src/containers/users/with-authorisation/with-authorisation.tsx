import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IAuthenticatedUser } from '../../../../common/dist';
import store from '../../../stores/root-store';

export const withAuthorisation = (
    WrappedComponent: React.ComponentType,
    condition: (user: IAuthenticatedUser) => boolean,
    placeholder?: React.ReactNode,
) => {
    const WithAuthorisationComponent = () => {

        if (!store.user.authenticatedUser) {
            throw new Error("Can't check authorisation if no user is authenticated. (Wrap in withAuthentication?)");
        }

        return condition(store.user.authenticatedUser)
            ? <WrappedComponent />
            : <>{placeholder}</>;
    };

    return observer(WithAuthorisationComponent);
};
