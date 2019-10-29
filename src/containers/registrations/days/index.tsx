import * as React from 'react';
import store from '../../../stores/root-store';
import { observer } from 'mobx-react';
import { Day as Day } from '../day';
import { IRegistration } from '../../../../common/dist';

export enum SortOrder {
    Ascending = 1,
    Descending = -1
}

export interface IDaysProps {
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    totalOnTop?: boolean;
    sortOrder?: SortOrder
    activeDate?: number;
    isCollapsable?: boolean;
    isMonthView: boolean;
    showHeaderAddButton?: boolean;
}

@observer
export class Days extends React.Component<IDaysProps> {
    private activeRegistrationRef: React.RefObject<Day>;
    constructor(props: IDaysProps) {
        super(props);
        this.activeRegistrationRef = React.createRef<Day>();
    }
    render() {
        const {
            sortOrder = SortOrder.Ascending,
            isMonthView,
            showHeaderAddButton = true,
        } = this.props;

        return (sortOrder > 0
            ? store.timesheets.registrationsGroupedByDay
            : store.timesheets.registrationsGroupedByDayReversed)
            .map((g, i) => {
                const isLastOpenedGroup = g.groupKey && g.groupKey.getDate() === this.props.activeDate;
                const isCollapsed =  !store.timesheets.selectedRegistrationDays
                    .some(d => d.getTime() === g.groupKey.getTime());

                return <Day
                    ref={isLastOpenedGroup ? this.activeRegistrationRef : null}
                    key={`group-${i}`}
                    group={g}
                    {...{ ...this.props, isCollapsed }}
                    headerClick={() => store.timesheets.toggleSelectedRegistrationDay(g.groupKey)}
                    isMonthView={isMonthView}
                    showHeaderAddButton={showHeaderAddButton}
                />
            });
    }

    componentDidMount() {
        // this.activeRegistrationRef.current && this.activeRegistrationRef.current.scrollIntoView();
    }
}