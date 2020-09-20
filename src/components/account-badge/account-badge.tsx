import React from "react";
import md5 from "md5";

import "./account-badge.scss";

type Gravatar = "404" | "mp" | "identicon" | "monsterid" | "wavatar" | "retro" | "robohash" | "blank";

export const AccountBadge = ({
    name,
    email,
    defaultGravatar = "mp",
    size = 40,
    onClick,
}: {
    name: string;
    email: string;
    defaultGravatar?: Gravatar;
    size?: number;
    onClick?: () => void;
}) => {
    return (
        <div
            className="account-badge"
            onClick={onClick}
        >
            <div className="account-badge--content">
                <div className="account-badge--image">
                    <img src={`https://www.gravatar.com/avatar/${md5(email)}?d=${defaultGravatar}&s=${size}`} />
                </div>
                <div className="account-badge--name">
                    {name}
                </div>

            </div>
        </div>
    )
};
AccountBadge.displayName = "AccountBadge";
