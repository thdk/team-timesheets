import React, { PropsWithChildren, HTMLProps } from "react";
import classNames from "classnames";

export const DataRowColumn = ({
    className,
    children,
    ...divProps
}: PropsWithChildren<HTMLProps<HTMLDivElement>>) => {
    const cssClass = classNames(
        "data-row__column",
        className,
    );
    return (
        <div
            className={cssClass}
            {...divProps}
        >
            {children}
        </div>
    );
};
