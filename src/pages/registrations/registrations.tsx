import * as React from 'react';
import { Timesheet } from '../../containers/timesheet';
import { RedirectToLogin } from '../../internal';
import { withAuthentication } from '../../containers/users/with-authentication';

export const RegistrationsPage = withAuthentication(
    Timesheet,
    <RedirectToLogin />,
);
