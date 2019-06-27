import * as React from 'react';
import { observer } from "mobx-react";
import moment from 'moment-es6';
import { Fab } from "../mdc/buttons/fab";
import routes from '../routes/index';
import store from '../stores/RootStore';
import { FlexGroup } from './Layout/flex';
import { goToOverview } from '../routes/timesheets/overview';
import { GroupedRegistration } from './GroupedRegistration';
import { GroupedRegistrations, SortOrder } from './GroupedRegistrations';
import { ListItem, List, ListDivider } from '../mdc/list';
import { IRegistration } from '../../common/dist';
import { goToRegistration } from '../internal';

@observer
export class Timesheets extends React.Component {
    registrationClick = (id: string) => {
        store.timesheets.setSelectedRegistrationId(id);
        goToRegistration(id);
    }

    registrationSelect = (id: string, data: IRegistration) => {
        store.view.toggleSelection(id, data);
    }

    createTotalLabel = (date: Date) => {
        return store.view.day
            ? `Total`
            : <a href="#" onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToDate(e, date);
            }}>
                {moment(date).format("MMMM Do")}
            </a>;
    }

    goToDate(e: React.MouseEvent, date: Date) {
        e.preventDefault();
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        }, { track: true })
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
                    createTotalLabel={this.createTotalLabel}
                    registrationClick={this.registrationClick.bind(this)}
                    registrationToggleSelect={this.registrationSelect.bind(this)}
                    isCollapsed={false}
                    headerClick={() => { }}
                />
                : <></>;
        } else {
            const totalTime = Array.from(store.timesheets.registrationsGroupedByDay)
                .reduce((p, c) => p + c.totalTime, 0);

            const totalLabel = `Total in ${store.view.moment.format('MMMM')}`;
            const total = <ListItem key={`total-month`} lines={[totalLabel]} meta={parseFloat(totalTime.toFixed(2)) + " hours"} disabled={true}></ListItem>
            const totalList = <List style={{ width: "100%" }}>{total}<ListDivider></ListDivider></List>;

            const sortOrder = store.timesheets.registrationsGroupedByDaySortOrder;
            const today = new Date();
            const activeDate = sortOrder === SortOrder.Descending && store.view.month && (store.view.month - 1) === today.getMonth() ? today.getDate() : undefined;

            regs = <>
                <GroupedRegistrations activeDate={activeDate} totalOnTop={true}
                    createTotalLabel={this.createTotalLabel}
                    registrationClick={this.registrationClick.bind(this)}
                    registrationToggleSelect={this.registrationSelect.bind(this)}
                    sortOrder={sortOrder}
                    isCollapsed={store.timesheets.areGroupedRegistrationsCollapsed}
                    isCollapsable={true}
                >
                </GroupedRegistrations>
                {totalList}
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
                <Fab onClick={this.addRegistration} icon="add" name="Add new registration"></Fab>
            </>
        );
    }

    addRegistration = () => {
        store.router.goTo(routes.newRegistration, {}, store);
    }
}