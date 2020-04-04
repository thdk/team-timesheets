import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IAuthenticatedUser } from '../../../../common/dist';
import { StoreContext } from '../../../contexts/store-context';
import { useContext } from 'react';

export interface IWithAuthenticationOptions {
    placeholder?: JSX.Element,
    condition?: (user?: IAuthenticatedUser) => boolean,
}

export const withAuthentication = (
    WrappedComponent: React.ComponentType,
    placeholder: JSX.Element = <></>,
) => {
    const WithAuthenticationComponent = () => {
        const { user } = useContext(StoreContext);
        return user.authenticatedUser
            ? <WrappedComponent />
            : placeholder;
    };


    return observer(WithAuthenticationComponent);
};
