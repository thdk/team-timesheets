import * as React from 'react';
import { ListDivider } from '@rmwc/list';
import { observer } from 'mobx-react-lite';

import { IGroupedRegistrations } from '../../../stores/registration-store/registration-store';
import { RegistrationLines } from '../../registrations/lines';
export const Day = observer(({
    group: {
        registrations,
    },
    registrationClick,
    registrationToggleSelect: registrationSelect,
    isCollapsed,
}: {
    group: IGroupedRegistrations<string>;
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string) => void;
    isCollapsed: boolean;
}) => {
    const listStyle = { width: '100%' };

    return registrations.length
        ? <div style={{ ...listStyle, display: isCollapsed ? "none" : "block" }}>
            <RegistrationLines
                registrations={registrations}
                registrationClick={registrationClick}
                registrationToggleSelect={registrationSelect}>
            </RegistrationLines>
            <ListDivider />
        </div>
        : null;
});
