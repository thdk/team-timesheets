import * as React from 'react';
import { ListDivider } from '../mdc/list';
import { IGroupedRegistrations } from '../stores/TimesheetsStore';
import { observer } from 'mobx-react';
import { IRegistration } from '../../common/dist';
import { RegistrationLines } from './registrations/RegistrationLine/RegistrationLines';
import GroupedRegistrationHeader from './GroupedRegistrationHeader/GroupedRegistrationHeader';


export interface IGroupedRegistrationProps {
    group: IGroupedRegistrations<Date>;
    registrationClick: (id: string) => void;
    headerClick: (e: React.MouseEvent) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    totalOnTop?: boolean;
    isCollapsed: boolean;
    isMonthView?: boolean;
    showHeaderAddButton?: boolean;
}

@observer
export class GroupedRegistration extends React.Component<IGroupedRegistrationProps> {
    private registrationRef: React.RefObject<HTMLDivElement>;
    constructor(props: IGroupedRegistrationProps) {
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
        return (
            <div ref={this.registrationRef}>
                {topTotal}
                <div style={{ ...listStyle, display: isCollapsed ? "none" : "block" }}>
                    <RegistrationLines
                        registrations={registrations}
                        registrationClick={registrationClick}
                        registrationToggleSelect={registrationSelect}>
                    </RegistrationLines>
                    <ListDivider></ListDivider>
                </div>
                {bottomTotal}
            </div>
        );
    }

    public scrollIntoView() {
        this.registrationRef.current && this.registrationRef.current.scrollIntoView({ behavior: "smooth" });
    }
}