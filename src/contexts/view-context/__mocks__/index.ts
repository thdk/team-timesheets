import moment from "moment";

export const useViewStore = jest.fn().mockReturnValue({
    isDrawerOpen: true,
    moment: moment(new Date(2020, 2, 22)),
    toggleSelection: jest.fn(),
    selection: new Map(),
    setIsDrawerOpen: jest.fn(),
    startOfDay: new Date(Date.UTC(2020, 2, 22)),
    endOfDay: new Date(Date.UTC(2020, 2, 22, 23, 59, 59)),
});
