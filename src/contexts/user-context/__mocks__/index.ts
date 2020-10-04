export const useUserStoreMock = {
    authenticatedUser: {
        email: "foobar@email.com",
        name: "Foobar",
    },
    divisionUser: {
        email: "foobar@email.com",
        name: "Foobar",
    },
} as ReturnType<typeof useUserStore>;

export const useUserStore = jest.fn().mockReturnValue(useUserStoreMock);
