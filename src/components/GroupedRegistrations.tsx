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
    activeDate?: number;
}

@observer
export class GroupedRegistrations extends React.Component<IGroupedRegistrationsProps> {
    private activeRegistrationRef: React.RefObject<GroupedRegistration>;
    constructor(props: IGroupedRegistrationsProps) {
        super(props);
        this.activeRegistrationRef = React.createRef<GroupedRegistration>();
    }
    render() {
        return store.timesheets.registrationsGroupedByDay.map((g, i) => {
            return <GroupedRegistration ref={g.groupKey && g.groupKey.getDate() === this.props.activeDate ? this.activeRegistrationRef : null} denseList={true} key={`group-${i}`} group={g} {...this.props}></GroupedRegistration>
        });
    }

    componentDidMount() {
        this.activeRegistrationRef.current && this.activeRegistrationRef.current.scrollIntoView();
    }
}