import React from "react";
import { useDivisionStore } from "../../../contexts/division-context";
import { DivisionUsersMenu } from "./division-users-menu";
import { render } from "@testing-library/react";
import { IDivision } from "../../../../common/interfaces/IOrganisation";


jest.mock('../../configs/use-configs');
jest.mock('../../../stores/router-store');
jest.mock('../../../contexts/division-context');
jest.mock('../../configs/use-configs');

jest.mock('../../../contexts/user-context');

describe("DivisionUsersMenu", () => {
    beforeAll(() => {
        (useDivisionStore as jest.Mock<ReturnType<typeof useDivisionStore>>).mockReturnValue(
            {
                userDivisions: [] as (IDivision & { divisionUserId: string })[],
            } as ReturnType<typeof useDivisionStore>
        );
    });

    it("should render", () => {
        const {
            asFragment,
        } = render(
            <DivisionUsersMenu />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
