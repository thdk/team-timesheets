import * as React from 'react';
import store from '../stores/RootStore';
import { IReactProps } from '../types';
import { observer } from 'mobx-react';
import { GroupedRegistration } from './GroupedRegistration';
import { IRegistration } from '../stores/TimesheetsStore';

export interface IGroupedRegistrationsProps extends IReactProps {
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
}

@observer
export class GroupedRegistrations extends React.Component<IGroupedRegistrationsProps> {
    render() {
        return store.timesheets.registrationsGroupedByDay.map((g, i) => {
            return <GroupedRegistration denseList={true} key={`group-${i}`} group={g} {...this.props}></GroupedRegistration>
        });
    }
}