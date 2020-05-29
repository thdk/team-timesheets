import * as React from 'react';
import { observer } from "mobx-react";
import { goToRegistration, goToOverview, RedirectToLogin } from '../../internal';
import { Day } from '../../containers/registrations/day';
import { SortOrder, Days } from '../../containers/registrations/days';
import { FlexGroup } from '../../components/layout/flex';
import { withAuthentication } from '../../containers/users/with-authentication';
import { StoreContext } from '../../contexts/store-context';
import { ListDivider } from '@rmwc/list';


@observer
class Timesheet extends React.Component {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    registrationClick = (id: string) => {
        if (this.context.view.selection.size) {
            this.context.view.toggleSelection(id);
        } else {
            this.context.timesheets.setSelectedRegistration(id);
            goToRegistration(this.context.router, id);
        }
    }

    registrationSelect = (id: string) => {
        this.context.view.toggleSelection(id);
    }

    goToMonth(e: React.MouseEvent) {
        e.preventDefault();
        goToOverview(this.context, {
            year: this.context.view.year!,
            month: this.context.view.month!
        }, { track: false, currentDate: this.context.view.track ? this.context.view.day! : undefined });
    }

    render() {
        if (!this.context.view.moment) return null;

        let regs: React.ReactNode;

        if (this.context.view.day) {
            const group = this.context.timesheets.registrationsGroupedByDay.filter(g => g.groupKey === this.context.view.moment.toDate().toDateString());

            regs = <Day group={group[0] || { groupKey: this.context.view.moment.toDate().toDateString(), totalTime: 0, registrations: [] }}
                registrationClick={this.registrationClick.bind(this)}
                registrationToggleSelect={this.registrationSelect.bind(this)}
                isCollapsed={false}
                headerClick={() => { }}
            />;
        } else {
            const totalTime = this.context.timesheets.registrationsTotalTime;

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

            const sortOrder = this.context.timesheets.registrationsGroupedByDaySortOrder;
            const today = new Date();
            const activeDate =
                sortOrder === SortOrder.Descending
                    && this.context.view.month
                    && (this.context.view.month - 1) === today.getMonth()
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
                    isMonthView={!this.context.view.day}
                >
                </Days>
            </>;
        }


        const title = this.context.view.day
            ? <>Timesheet <a href="#" onClick={this.goToMonth.bind(this)}>{this.context.view.moment.format('MMMM')}</a> {this.context.view.moment.format('D, YYYY')}</>
            : `Timesheet ${this.context.view.moment.format('MMMM YYYY')}`;
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

export const RegistrationsPage = withAuthentication(
    Timesheet,
    <RedirectToLogin />,
);
