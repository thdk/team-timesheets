import * as React from 'react';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../internal';
import { RegistrationDetail } from '../../containers/registrations/detail';

export default withAuthentication(
    RegistrationDetail,
    <RedirectToLogin />,
);
