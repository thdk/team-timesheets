import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { useAuthStore } from '../../../contexts/auth-context';

export interface IWithAuthenticationOptions {
    placeholder?: JSX.Element,
}

export function withAuthentication<T extends object>(
    WrappedComponent: React.ComponentType<T>,
    placeholder: JSX.Element = <></>,
) {
    const WithAuthenticationComponent = (props: T) => {
        const authStore = useAuthStore();

        return authStore.activeDocumentId
            ? <WrappedComponent {...props} />
            : placeholder;
    };


    return observer(WithAuthenticationComponent);
}
