import { reaction } from 'mobx';
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

        const [user, setUser] = React.useState<IAuthenticatedUser | undefined | null>(store.user.authenticatedUser);

        React.useEffect(() => {
            return reaction(() => store.user.authenticatedUser, user => {
                setUser(user || null);
            }, { fireImmediately: false });
        }, []);

        // user authentication still unknown...
        if (user === undefined) return <></>;

        return user
            ? <WrappedComponent />
            : placeholder;
    };


    return observer(WithAuthenticationComponent);
};
