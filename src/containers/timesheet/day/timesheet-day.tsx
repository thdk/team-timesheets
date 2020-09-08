import * as React from 'react';
import { ListDivider } from '@rmwc/list';
import { observer } from 'mobx-react-lite';

import { IGroupedRegistrations } from '../../../stores/registration-store/registration-store';
import { RegistrationLines } from '../../registrations/lines';
import { GroupedRegistrationHeader } from '../day-header';

export const Day = observer(({
    group: {
        registrations,
        groupKey,
        totalTime
    },
    registrationClick,
    headerClick,
    registrationToggleSelect: registrationSelect,
    isCollapsed,
    isMonthView = false,
    showHeaderAddButton = true,
}: {
    group: IGroupedRegistrations<string>;
    registrationClick: (id: string) => void;
    headerClick: (e: React.MouseEvent) => void;
    registrationToggleSelect?: (id: string) => void;
    isCollapsed: boolean;
    isMonthView?: boolean;
    showHeaderAddButton?: boolean;
}) => {

    const totalList = <GroupedRegistrationHeader
        headerClick={headerClick}
        groupKey={groupKey}
        totalTime={totalTime}
        isCollapsable={isMonthView}
        isCollapsed={isCollapsed}
        isMonthView={isMonthView}
        showAddButton={showHeaderAddButton}
    ></GroupedRegistrationHeader>

    const listStyle = { width: '100%' };

    const regsJSX = registrations.length
        ? <div style={{ ...listStyle, display: isCollapsed ? "none" : "block" }}>
            <RegistrationLines
                registrations={registrations}
                registrationClick={registrationClick}
                registrationToggleSelect={registrationSelect}>
            </RegistrationLines>
            <ListDivider></ListDivider>
        </div>
        : null;

    return (
        <div>
            {totalList}
            <ListDivider></ListDivider>
            {regsJSX}
        </div>
    );
});
