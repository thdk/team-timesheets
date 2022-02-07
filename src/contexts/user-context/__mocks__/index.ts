export const useUserStoreMock = {
    authenticatedUser: {
        email: "foobar@email.com",
        name: "Foobar",
        roles: {
            admin: true,
        },
    },
    divisionUser: {
        email: "foobar@email.com",
        name: "Foobar",
        roles: {
            admin: true,
        },
    },
    usersCollection: {
        isFetched: true,
    },
    divisionUsersCollection: {
        isFetched: true,
    },
    updateDivisionUser: jest.fn(),
} as ReturnType<typeof useUserStore>;

export const useUserStore = jest.fn().mockReturnValue(useUserStoreMock);
