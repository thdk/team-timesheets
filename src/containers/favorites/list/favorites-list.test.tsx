import React from "react";
import { render } from "@testing-library/react";
import { FavoritesList } from "./favorites-list";

describe("FavoritesList", () => {
    it("should render without favorites", () => {
        const { asFragment } = render(
            <FavoritesList
                favorites={[]}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    // it("should render favorites", () => {
    //     const { asFragment } = render(
    //             <FavoritesList
    //                 favorites={[
    //                     {
    //                         data: {
    //                             groupId: "group-1",
    //                             userId: "user-1",
    //                             client: "client-1",
    //                             description: "Favorite desc 1",
    //                             project: "project-1",
    //                             task: "task-1",
    //                             time: 3
    //                         },
    //                         id: "favorite-1",
    //                     } as unknown as Doc<IFavoriteRegistration>
    //                 ]}
    //             />
    //     );

    //     expect(asFragment()).toMatchSnapshot();
    // });
});