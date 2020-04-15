import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { IAuthenticatedUser } from '../../../../common/dist';
import { useStore } from '../../../contexts/store-context';

export interface IWithAuthenticationOptions {
    placeholder?: JSX.Element,
    condition?: (user?: IAuthenticatedUser) => boolean,
}

export const withAuthentication = (
    WrappedComponent: React.ComponentType,
    placeholder: JSX.Element = <></>,
) => {
    const WithAuthenticationComponent = () => {
        const store = useStore();
        return store.user.authenticatedUser
            ? <WrappedComponent />
            : placeholder;
    };


    return observer(WithAuthenticationComponent);
};
