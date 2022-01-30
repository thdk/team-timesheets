export const useGapiAuth = jest.fn().mockReturnValue({
    signIn: jest.fn(),
    signOut: jest.fn(),
    user: {},
    isInitialized: true,
});
