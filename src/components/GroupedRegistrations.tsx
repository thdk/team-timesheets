import * as React from 'react';
import store from '../stores/RootStore';
import { IReactProps } from '../types';
import { observer } from 'mobx-react';
import { GroupedRegistration } from './GroupedRegistration';

export interface IGroupedRegistrationsProps extends IReactProps {
    registrationClick: (id: string) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
}

@observer
export class GroupedRegistrations extends React.Component<IGroupedRegistrationsProps> {
    render() {
        return store.timesheets.registrationsGroupedByDay.map((g, i) => {
            return <GroupedRegistration key={`group-${i}`} group={g} {...this.props}></GroupedRegistration>
        });
    }
}