import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useUserStore } from "../../../contexts/user-context";
import { IUser } from '../../../../common';

export const withAuthorisation = (
    WrappedComponent: React.ComponentType,
    condition: (user: IUser) => boolean,
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
