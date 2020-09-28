export const useUserStore = jest.fn().mockReturnValue({
    authenticatedUser: {
        email: "foobar@email.com",
        name: "Foobar",
    },
    divisionUser: {
        email: "foobar@email.com",
        name: "Foobar",
    },
});
