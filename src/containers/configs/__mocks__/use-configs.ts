export const useConfigs = jest.fn().mockReturnValue({
    getConfigValue: jest.fn().mockReturnValue(true),
    configsCollection: {
        isFetched: true,
    },
});
