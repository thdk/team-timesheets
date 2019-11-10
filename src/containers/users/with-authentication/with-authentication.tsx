import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IAuthenticatedUser } from '../../../../common/dist';
import store from '../../../stores/root-store';

export interface IWithAuthenticationOptions {
    placeholder?: JSX.Element,
    condition?: (user?: IAuthenticatedUser) => boolean,
}

export const withAuthentication = (
    WrappedComponent: React.ComponentType,
    placeholder: JSX.Element = <></>,
) => {
    const WithAuthenticationComponent = () => {

        return store.user.authenticatedUser
            ? <WrappedComponent />
            : placeholder;
    };


    return observer(WithAuthenticationComponent);
};
