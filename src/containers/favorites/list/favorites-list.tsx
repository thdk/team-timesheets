import React from "react";
import { Doc } from "firestorable";
import { IFavoriteRegistration } from "../../../../common";
import { RegistrationLines } from "../../registrations/lines";

export const FavoritesList = ({
    favorites,
}: {
    favorites: Doc<IFavoriteRegistration>[],
}) => {
    return (
        <RegistrationLines
            registrations={favorites}
        ></RegistrationLines>
    );
}
