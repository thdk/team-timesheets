import moment from "moment";

export const useViewStore = jest.fn().mockReturnValue({
    isDrawerOpen: true,
    moment: moment(new Date(2020, 2 ,22)),
});
