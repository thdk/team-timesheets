import { IGroupedRegistrations } from '../../../stores/registration-store/registration-store';

export const useRegistrationStore = jest.fn().mockReturnValue({
    dayRegistrations: {
        groupKey: "2022-01-01",
        registrations: [],
    } as unknown as IGroupedRegistrations<string>
});
