import * as React from 'react';
import { observer } from "mobx-react";
import store from '../../../stores/RootStore';
import { goToRegistration, goToOverview } from '../../../internal';
import { IRegistration } from '../../../../common';
import { GroupedRegistration } from '../../GroupedRegistration';
import { ListDivider } from '../../../mdc/list';
import { SortOrder, GroupedRegistrations } from '../../GroupedRegistrations';
import { FlexGroup } from '../../Layout/flex';


@observer
export class Timesheet extends React.Component {
    registrationClick = (id: string) => {
        if (store.view.selection.size) {
            store.view.toggleSelection(id, true);
        } else {
            store.timesheets.setSelectedRegistrationId(id);
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

            regs = group.length
                ? <GroupedRegistration group={group[0]}
                    registrationClick={this.registrationClick.bind(this)}
                    registrationToggleSelect={this.registrationSelect.bind(this)}
                    isCollapsed={false}
                    headerClick={() => { }}
                />
                : <></>;
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
                <GroupedRegistrations
                    activeDate={activeDate}
                    totalOnTop={true}
                    registrationClick={this.registrationClick.bind(this)}
                    registrationToggleSelect={this.registrationSelect.bind(this)}
                    sortOrder={sortOrder}
                    isCollapsed={store.timesheets.areGroupedRegistrationsCollapsed}
                    isCollapsable={true}
                    isMonthView={!store.view.day}
                >
                </GroupedRegistrations>
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

export default Timesheet;