import React, { HTMLProps } from "react";
import md5 from "md5";

import "./account-badge.scss";
import { ReactNode } from "react";

type Gravatar = "404" | "mp" | "identicon" | "monsterid" | "wavatar" | "retro" | "robohash" | "blank";

export const AccountBadge = ({
    name,
    email,
    defaultGravatar = "mp",
    size = 40,
    meta,
    ...props
}: {
    name: string;
    email: string;
    defaultGravatar?: Gravatar;
    size?: number;
    meta?: ReactNode;
} & HTMLProps<HTMLDivElement>) => {
    return (
        <div
            className="account-badge"
            {...props}
        >
            <div className="account-badge__content">
                <div className="account-badge__image">
                    <img src={`https://www.gravatar.com/avatar/${md5(email)}?d=${defaultGravatar}&s=${size}`} />
                </div>
                <div className="account-badge__name">
                    {name}
                </div>
                {meta}
            </div>
        </div>
    )
};
AccountBadge.displayName = "AccountBadge";
