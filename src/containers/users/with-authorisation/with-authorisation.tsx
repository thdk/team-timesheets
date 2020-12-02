import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { useUserStore } from "../../../contexts/user-context";
import { IUser } from '../../../../common';
import { useAuthStore } from '../../../contexts/auth-context';

export const withAuthorisation = <T extends {}>(
    WrappedComponent: React.ComponentType<T>,
    condition: (user: IUser) => boolean,
    placeholder?: React.ReactNode,
) => {
    return observer((props: T) => {
        const user = useUserStore();
        const auth = useAuthStore();

        if (!auth.isAuthInitialised
            || !user.divisionUsersCollection.isFetched
            || !user.authenticatedUser
        ) {
            return <></>;
        }

        if (auth.activeDocument?.divisionUserId && auth.activeDocument?.divisionUserId !== user.divisionUser?.id) {
            return null;
        }

        return user.divisionUser && condition(user.divisionUser)
            ? <WrappedComponent {...props} />
            : <>{placeholder}</>;
    });
};
