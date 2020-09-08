import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { IAuthenticatedUser } from '../../../../common/dist';
import { useUserStore } from "../../../contexts/user-context";

export interface IWithAuthenticationOptions {
    placeholder?: JSX.Element,
    condition?: (user?: IAuthenticatedUser) => boolean,
}

export function withAuthentication<T extends object>(
    WrappedComponent: React.ComponentType<T>,
    placeholder: JSX.Element = <></>,
) {
    const WithAuthenticationComponent = (props: T) => {
        const user = useUserStore();
        return user.authenticatedUser
            ? <WrappedComponent {...props} />
            : placeholder;
    };


    return observer(WithAuthenticationComponent);
};
