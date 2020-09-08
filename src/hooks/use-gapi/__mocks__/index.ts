export const useGapi = jest.fn().mockReturnValue({
    signIn: jest.fn(),
    signOut: jest.fn(),
    user: {},
    isGapiLoaded: true,
});
