import * as React from 'react';
import { Timesheet } from '../../containers/timesheet';
import { RedirectToLogin } from '../../internal';
import { withAuthentication } from '../../containers/users/with-authentication';
import { withAuthorisation } from '../../containers/users/with-authorisation';
import { canAddRegistrations } from '../../rules';
import { Redirect } from '../../routes/actions';
import routes from '../../routes/users';

export const RegistrationsPage = withAuthorisation(
    withAuthentication(
        Timesheet,
        <RedirectToLogin />,
    ),
    canAddRegistrations,
    <Redirect
        route={routes.userProfile}
        queryParams={{
            tab: "divisions",
        }}
    />
);
