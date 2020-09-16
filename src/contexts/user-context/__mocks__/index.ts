export const useUserStore = jest.fn().mockReturnValue({
    authenticatedUser: {
        email: "foobar@email.com",
        name: "Foobar",
    },
});
