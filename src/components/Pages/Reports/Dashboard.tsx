import * as React from 'react';
import { FlexGroup } from '../../Layout/flex';
import { RegistrationsPerProject } from '../../../routes/reports/RegistrationsPerProject';
import { RegistrationsPerTask } from '../../../routes/reports/RegistrationsPerTask';
import { RegistrationsPerUser } from './RegistrationsPerUser';
import store from '../../../stores/RootStore';
import { when, IReactionDisposer } from 'mobx';

export const chartColors = {
    blue: "rgb(54, 162, 235)",
    green: "rgb(75, 192, 192)",
    grey: "rgb(201, 203, 207)",
    orange: "rgb(255, 159, 64)",
    purple: "rgb(153, 102, 255)",
    red: "rgb(255, 99, 132)",
    yellow: "rgb(255, 205, 86)"
}

export class Dashboard extends React.Component {
    private getUsersReactionDisposer?: IReactionDisposer;

    render() {
        const getUserLabels = () => new Promise<{
            [key: string]: string
        }>(resolve => {
            if (!store.user.users.docs.size) store.user.users.getDocs()

            this.getUsersReactionDisposer = when(() => !!store.user.users.docs.size, () =>
                resolve(Array.from(store.user.users.docs.values())
                    .reduce((p, c) => {
                        p[c.id] = c.data!.name;
                        return p;
                    }, {} as {
                        [key: string]: string
                    })
                )
            );
        });

        return (
            <>
                <FlexGroup>
                    <RegistrationsPerProject></RegistrationsPerProject>
                    <RegistrationsPerTask></RegistrationsPerTask>
                </FlexGroup>
                <FlexGroup>
                    <RegistrationsPerUser data={store.dashboard.registrationsGroupedByUser} getLabels={getUserLabels} ></RegistrationsPerUser>
                </FlexGroup>
            </>
        );
    }

    componentDidMount() {
        store.dashboard.setUserFilter(store.user.userId!);
    }

    componentWillUnmount() {
        this.getUsersReactionDisposer && this.getUsersReactionDisposer();
    }
}
