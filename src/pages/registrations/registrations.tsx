import * as React from 'react';
import { observer } from "mobx-react";
import store from '../../stores/root-store';
import { goToRegistration, goToOverview, RedirectToLogin } from '../../internal';
import { IRegistration } from '../../../common';
import { Day } from '../../containers/registrations/day';
import { ListDivider } from '../../mdc/list';
import { SortOrder, Days } from '../../containers/registrations/days';
import { FlexGroup } from '../../components/layout/flex';
import { withAuthentication } from '../../containers/users/with-authentication';

@observer
class Timesheet extends React.Component {
    registrationClick = (id: string) => {
        if (store.view.selection.size) {
            store.view.toggleSelection(id, true);
        } else {
            store.timesheets.setSelectedRegistration(id);
            goToRegistration(id);
        }
    }

    registrationSelect = (id: string, data: IRegistration) => {
        store.view.toggleSelection(id, data);
    }

    goToMonth(e: React.MouseEvent) {
        e.preventDefault();
        goToOverview(store, {
            year: store.view.year!,
            month: store.view.month!
        }, { track: false, currentDate: store.view.track ? store.view.day! : undefined });
    }

    render() {
        if (!store.view.moment) return null;

        let regs: React.ReactNode;

        if (store.view.day) {
            const group = store.timesheets.registrationsGroupedByDay.filter(g => g.groupKey.getDate() === store.view.day);

            regs = <Day group={group[0] || { groupKey: store.view.moment.toDate(), totalTime: 0, registrations: [] }}
                registrationClick={this.registrationClick.bind(this)}
                registrationToggleSelect={this.registrationSelect.bind(this)}
                isCollapsed={false}
                headerClick={() => { }}
            />;
        } else {
            const totalTime = store.timesheets.registrationsTotalTime;

            const totalLabel = `Total time: ${parseFloat(totalTime.toFixed(2))} hours`;
            const total = <div
                className="timesheets-header-label"
                key={`total-month`}>
                {totalLabel}
            </div>
            const totalList = <div className="timesheets-header">
                {total}
                <ListDivider></ListDivider>
            </div>;

            const sortOrder = store.timesheets.registrationsGroupedByDaySortOrder;
            const today = new Date();
            const activeDate =
                sortOrder === SortOrder.Descending
                    && store.view.month
                    && (store.view.month - 1) === today.getMonth()
                    ? today.getDate()
                    : undefined;

            regs = <>
                {totalList}
                <Days
                    activeDate={activeDate}
                    totalOnTop={true}
                    registrationClick={this.registrationClick.bind(this)}
                    registrationToggleSelect={this.registrationSelect.bind(this)}
                    sortOrder={sortOrder}
                    isCollapsable={true}
                    isMonthView={!store.view.day}
                >
                </Days>
            </>;
        }


        const title = store.view.day
            ? <>Timesheet <a href="#" onClick={this.goToMonth}>{store.view.moment.format('MMMM')}</a> {store.view.moment.format('D, YYYY')}</>
            : `Timesheet ${store.view.moment.format('MMMM YYYY')}`;
        return (
            <>
                <FlexGroup direction="vertical">
                    <div style={{ paddingLeft: "1em" }}>
                        <h3 className="mdc-typography--subtitle1">
                            {title}
                        </h3>
                    </div>
                    {regs}
                </FlexGroup>
            </>
        );
    }
}

export default withAuthentication(
    Timesheet,
    <RedirectToLogin />,
);
