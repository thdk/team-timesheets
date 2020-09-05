import React, { ReactNode } from "react";
import classNames from "classnames";

import "./data-row.scss";

export const DataRow = ({
    line1,
    line2,
    icon,
    extraHeader,
}: {
    line1: ReactNode,
    line2: ReactNode,
    icon: string,
    extraHeader?: ReactNode,
}) => {

    const Header = () => icon
        ? (
            <div className="data-row__header">
                <span className="icon material-icons" aria-hidden="true" >{icon}</span>
            </div>
        )
        : null;

    const ExtraHeader = () => extraHeader
        ? (
            <div className="data-row__extra-header">
                {extraHeader}
            </div>
        )
        : null;

    const Line1 = () => line1
        ? <span className="data-row__line1 mdc-typography--subtitle1">
            {line1}
        </span>
        : null;

    const Line2 = () => line2 ?
        <span className="data-row__line2 mdc-typography--subtitle2">
            {line2}
        </span>
        : null;


    const styles = classNames("data-row");

    return (
        <div className={styles}>
            <Header />

            <ExtraHeader />

            <div className="data-row__column">
                <Line1 />
                <Line2 />
            </div>
        </div>
    );
};