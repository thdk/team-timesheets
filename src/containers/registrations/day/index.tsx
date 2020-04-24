import * as React from 'react';
import { ListDivider } from '../../../mdc/list';
import { IGroupedRegistrations } from '../../../stores/registration-store/registration-store';
import { observer } from 'mobx-react';
import { RegistrationLines } from '../lines';
import GroupedRegistrationHeader from '../day-header';

export interface IDayProps {
    group: IGroupedRegistrations<string>;
    registrationClick: (id: string) => void;
    headerClick: (e: React.MouseEvent) => void;
    registrationToggleSelect?: (id: string) => void;
    totalOnTop?: boolean;
    isCollapsed: boolean;
    isMonthView?: boolean;
    showHeaderAddButton?: boolean;
}

@observer
export class Day extends React.Component<IDayProps> {
    private registrationRef: React.RefObject<HTMLDivElement>;
    constructor(props: IDayProps) {
        super(props);
        this.registrationRef = React.createRef();
    }

    render() {
        const {
            group: {
                registrations,
                groupKey,
                totalTime
            },
            totalOnTop = true,
            registrationClick,
            headerClick,
            registrationToggleSelect: registrationSelect,
            isCollapsed,
            isMonthView = false,
            showHeaderAddButton = true,
        } = this.props;

        const totalList = <GroupedRegistrationHeader
            headerClick={headerClick}
            groupKey={groupKey}
            totalTime={totalTime}
            isCollapsable={isMonthView}
            isCollapsed={isCollapsed}
            isMonthView={isMonthView}
            showAddButton={showHeaderAddButton}
        ></GroupedRegistrationHeader>

        const topTotal = totalOnTop
            ? <>
                {totalList}
                <ListDivider></ListDivider>
            </>
            : undefined;
        const bottomTotal = totalOnTop ? undefined : totalList;

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
            <div ref={this.registrationRef}>
                {topTotal}
                {regsJSX}
                {bottomTotal}
            </div>
        );
    }

    public scrollIntoView() {
        this.registrationRef.current && this.registrationRef.current.scrollIntoView({ behavior: "smooth" });
    }
}