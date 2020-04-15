import React from "react";
import { Doc } from "firestorable";
import { IRegistration } from "../../../../common";
import { RegistrationLines } from "../../registrations/lines";

export const FavoritesList = ({
    favorites,
}: {
    favorites: Doc<IRegistration>[],
}) => {
    return (
        <RegistrationLines
            readOnly={true}
            registrationClick={() => { }}
            registrations={favorites}
        ></RegistrationLines>
    );
}
