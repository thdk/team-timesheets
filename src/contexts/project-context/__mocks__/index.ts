export const useProjectStore = jest.fn().mockReturnValue({
    projects: [],
    collection: {
        isFetched: true,
        docs: [],
    },
    activeProjects: [],
});
