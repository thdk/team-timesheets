import React from "react";
import moment from "moment";
import store from "../../../stores/root-store";
import { goToOverview, goToNewRegistration } from "../../../internal";
import { Button } from "@material/react-button";
import classNames from "classnames";

export type GroupedRegistrationHeaderProps = {
    readonly groupKey: Date;
    readonly totalTime: number;
    readonly headerClick: (e: React.MouseEvent) => void;
    readonly isCollapsed: boolean;
    readonly isCollapsable?: boolean;
    readonly isMonthView: boolean;
    readonly showAddButton?: boolean;
}

const GroupedRegistrationHeader = (props: GroupedRegistrationHeaderProps) => {
    const {
        groupKey,
        totalTime,
        headerClick,
        isCollapsable,
        isCollapsed,
        isMonthView,
        showAddButton = true,
    } = props;

    const goToDate = (e: React.MouseEvent, date: Date) => {
        e.preventDefault();
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        }, { track: true })
    };

    const createTotalLabel = (date: Date, total?: number) => {
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
                        goToDate(e, date);
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
                <Button
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        store.timesheets.toggleSelectedRegistrationDay(date, true);
                        goToNewRegistration(dateMoment);
                    }}
                    dense
                    className="grouped-registration-header-add-button"
                >+</Button>
            </>
            : <>
                {displayJSX}
            </>;

    };

    const titleJSX = createTotalLabel(groupKey, totalTime);
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