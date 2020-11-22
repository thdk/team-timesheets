import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { useUserStore } from "../../../contexts/user-context";
import { IUser } from '../../../../common';
import { useAuthStore } from '../../../contexts/auth-context';

export const withAuthorisation = (
    WrappedComponent: React.ComponentType,
    condition: (user: IUser) => boolean,
    placeholder?: React.ReactNode,
) => {
    const WithAuthorisationComponent = () => {
        const user = useUserStore();
        const auth = useAuthStore();

        if (!auth.isAuthInitialised 
            || !user.divisionUsersCollection.isFetched
            || !user.usersCollection.isFetched
            ) {
            return null;
        }

        return user.divisionUser && condition(user.divisionUser)
            ? <WrappedComponent />
            : <>{placeholder}</>;
    };

    return observer(WithAuthorisationComponent);
};
