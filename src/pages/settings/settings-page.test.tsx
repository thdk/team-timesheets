import React from "react";
import { SettingsPage } from "./settings-page";
import { render } from "@testing-library/react";

jest.mock("../../contexts/user-context", () => ({
    useUserStore: () => ({
        divisionUser: {
            id: "user-1",
            roles: {},
        },
    }),
}));

jest.mock("../../contexts/store-context", () => ({
    useStore: () => ({
        config: {
            tasks: [],
        },
    }),
}));

jest.mock('../../stores/router-store', () => ({
    useRouterStore: () => ({
        queryParams: {},
    }),
}));

jest.mock('./connections', () => ({
    Connections: () => <>Connections</>,
}));
jest.mock('../../containers/tasks/list', () => ({
    TaskList: () => <>Tasks-Content</>,
}));
jest.mock('../../containers/users/list', () => ({
    UserList: () => <>Users-Content</>,
}));
jest.mock('../../containers/clients/list', () => ({
    ClientList: () => <>Clients-Content</>,
}));
jest.mock('../../containers/teams/list', () => ({
    TeamList: () => <>Teams-Content</>,
}));

describe("SettingsPage", () => {

    it("should render", () => {
        const { asFragment } = render(
            <SettingsPage />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
