import * as React from 'react'
import moment from "moment";
import { goToOverview, goToNewRegistration } from "../../../internal";
import classNames from "classnames";
import FavoriteGroupsMenu from "../../favorite-groups/menu";
import { IRootStore } from "../../../stores/root-store";
import { useStore } from "../../../contexts/store-context";

import "./day-header.scss";

export type GroupedRegistrationHeaderProps = {
    readonly groupKey: string;
    readonly totalTime: number;
    readonly headerClick: (e: React.MouseEvent) => void;
    readonly isCollapsed: boolean;
    readonly isCollapsable?: boolean;
    readonly isMonthView: boolean;
    readonly showAddButton?: boolean;
}

const GroupedRegistrationHeader = (props: GroupedRegistrationHeaderProps) => {
    const store = useStore();

    const {
        groupKey,
        totalTime,
        headerClick,
        isCollapsable,
        isCollapsed,
        isMonthView,
        showAddButton = true,
    } = props;

    const goToDate = (store: IRootStore, e: React.MouseEvent, date: Date) => {
        e.preventDefault();
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        }, { track: true })
    };

    const createTotalLabel = (store: IRootStore, date: Date, total?: number) => {
        const dateMoment = moment(date);
        const totalJSX = total !== undefined
            ? <div className="grouped-registration-header-total">
                {parseFloat(total.toFixed(2))} hours
                </div>
            : null;


        const displayJSX = !isMonthView
            ? <>
                <div className="grouped-registration-header-label">
                    Total time: {parseFloat(totalTime.toFixed(2))} hours
                </div>
            </>
            : <>
                <a href="#"
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goToDate(store, e, date);
                    }}
                    className="grouped-registration-header-date"
                >
                    {dateMoment.format("MMMM Do")}
                </a>
                {totalJSX}
            </>;

        return showAddButton
            ? <>
                {displayJSX}
                <FavoriteGroupsMenu
                    onSelect={
                        id => {
                            if (!id) {
                                store.timesheets.toggleSelectedRegistrationDay(date.toDateString(), true);
                                goToNewRegistration(store, dateMoment);
                            } else {
                                store.favorites.getFavoritesByGroupIdAsync(id)
                                    .then(favoriteDocs => {
                                        store.timesheets.addRegistrations(
                                            favoriteDocs.map(reg =>
                                                store.timesheets.copyRegistrationToDate(reg.data!, date)
                                            )
                                        );
                                    })

                            }
                        }
                    }
                ></FavoriteGroupsMenu>
            </>
            : <>
                {displayJSX}
            </>;

    };

    const titleJSX = createTotalLabel(store, new Date(groupKey), totalTime);
    const collapseIconJSX = isCollapsable
        ? <i
            className="grouped-registration-header-icon material-icons mdc-icon-button__icon">
            {isCollapsed ? "chevron_right" : "expand_more"}
        </i>
        : null;

    const cssClass = classNames([
        "grouped-registration-header",
        {
            "grouped-registration-header--collapsable": isCollapsable
        }
    ]);

    return <div
        className={cssClass}
        onClick={headerClick}>
        {collapseIconJSX}
        {titleJSX}
    </div>;
};

export default GroupedRegistrationHeader;