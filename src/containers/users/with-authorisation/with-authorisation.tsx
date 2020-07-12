import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IAuthenticatedUser } from '../../../../common/dist';
import { useUserStore } from '../../../stores/user-store';

export const withAuthorisation = (
    WrappedComponent: React.ComponentType,
    condition: (user: IAuthenticatedUser) => boolean,
    placeholder?: React.ReactNode,
) => {
    const WithAuthorisationComponent = () => {
        const user = useUserStore();

        if (!user.authenticatedUser) {
            throw new Error("Can't check authorisation if no user is authenticated. (Wrap in withAuthentication?)");
        }

        return condition(user.authenticatedUser)
            ? <WrappedComponent />
            : <>{placeholder}</>;
    };

    return observer(WithAuthorisationComponent);
};
