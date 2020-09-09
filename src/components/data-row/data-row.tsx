import React, { HTMLProps, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

import "./data-row.scss";

export const DataRowLine1 = ({
    children,
}: PropsWithChildren<unknown>) => {
    return (
        children
            ? (
                <span className="data-row__line1 mdc-typography--subtitle1">
                    {children}
                </span>
            )
            : null
    );
}

export const DataRowLine2 = ({
    children,
}: PropsWithChildren<unknown>) => {
    return (
        children
            ? (
                <span className="data-row__line2 mdc-typography--subtitle2">
                    {children}
                </span>
            )
            : null
    );
}

export const DataRow = ({
    icon,
    children,
    className,
    allowEmptyHeader,
    ...divProps
}: HTMLProps<HTMLDivElement> & {
    icon?: ReactNode,
    allowEmptyHeader?: boolean
}) => {

    const Header = () => icon || allowEmptyHeader
        ? (
            <div className="data-row__header">
                {icon}
            </div>
        )
        : null;

    const styles = classNames([
        "data-row",
        className,
    ]);

    return (
        <div
            className={styles}
            {...divProps}
        >
            <Header />
            {children}
        </div>
    );
};