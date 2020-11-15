export const useAuthStoreMock = {
    activeDocument: {
        email: "foobar@email.com",
        name: "Foobar",
    },
    activeDocumentId: "user-1",
} as ReturnType<typeof useAuthStore>;

export const useAuthStore = jest.fn().mockReturnValue(useAuthStoreMock);
