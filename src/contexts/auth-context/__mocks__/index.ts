export const useAuthStoreMock = {
    isAuthInitialised: true,
    activeDocument: {
        email: "foobar@email.com",
        name: "Foobar",
    },
    activeDocumentId: "user-1",
    collection: {
        isFetched: true,
    },
} as ReturnType<typeof useAuthStore>;

export const useAuthStore = jest.fn().mockReturnValue(useAuthStoreMock);
