import * as React from 'react';
import { FlexGroup } from '../../Layout/flex';
import store from '../../../stores/RootStore';
import { IReactionDisposer, transaction, when } from 'mobx';
import CollectionSelect from '../../Controls/CollectionSelect';
import { observer } from 'mobx-react';
import { IProject, ITask } from '../../../stores/ConfigStore';
import { Box } from '../../Layout/box';
import { FormField } from '../../Layout/form';
import { canReadUsers } from '../../../rules/rules';
import { IUserRegistrationsChartProps, ChartType, IRegistrationsChartProps, RegistrationsChart } from './RegistrationsChart';
import { TimePeriodSelect, TimePeriod } from '../../Controls/TimePeriodSelect';

export const chartColors = {
    blue: "rgb(54, 162, 235)",
    green: "rgb(75, 192, 192)",
    grey: "rgb(201, 203, 207)",
    orange: "rgb(255, 159, 64)",
    purple: "rgb(153, 102, 255)",
    red: "rgb(255, 99, 132)",
    yellow: "rgb(255, 205, 86)"
}

@observer
export class Dashboard extends React.Component {
    private getUsersReactionDisposer?: IReactionDisposer;

    constructor(props: any) {
        super(props);

        if (!store.dashboard.timePeriodFilterValue) {
            when(() => !!store.user.currentUser, () => {
                transaction(() => {
                    store.dashboard.setUserFilter(store.user.userId);
                    store.dashboard.setTimePeriodFilter(TimePeriod.ThisMonth);
                });
            });
        }
    }

    render() {
        if (store.dashboard.timePeriodFilterValue === undefined) return null;

        const userChartProps: IUserRegistrationsChartProps = {
            title: "Time / user",
            data: store.dashboard.registrationsGroupedByUser,
            labelCollection: store.user.users,
            getLabel: user => user.name,
            chart: ChartType.Bar
        };

        const projectChartProps: IRegistrationsChartProps<IProject> = {
            title: "Time / project",
            data: store.dashboard.registrationsGroupedByProject,
            labelCollection: store.config.projects,
            getLabel: project => project.name,
            chart: ChartType.Doughnut
        };

        const taskChartProps: IRegistrationsChartProps<ITask> = {
            title: "Time / task",
            data: store.dashboard.registrationsGroupedByTask,
            labelCollection: store.config.tasks,
            getLabel: task => task.name,
            chart: ChartType.Doughnut
        };

        const userFilter = canReadUsers(store.user.currentUser)
            ? <>
                <FlexGroup>
                    <FormField first={false}>
                        <CollectionSelect value={store.dashboard.userFilterValue}
                            label="User"
                            onChange={this.onUserFilterChange}
                            items={
                                Array.from(store.user.users.docs.values())
                                    .map(doc => ({ name: doc.data!.name, id: doc.id }))
                            }>
                        </CollectionSelect>
                    </FormField>
                </FlexGroup>
            </>
            : null;

        const registrationsPerUserChart = canReadUsers(store.user.currentUser) && store.user.users.docs.size
            ? <RegistrationsChart {...userChartProps}>
            </RegistrationsChart>
            : null;

        return (
            <>
                <Box>
                    <FlexGroup style={{ justifyContent: "space-between" }}>
                        <FlexGroup>
                            <FormField>
                                <TimePeriodSelect value={
                                    store.dashboard.timePeriodFilterValue}
                                    onChange={this.onTimePeriodechange}></TimePeriodSelect>
                            </FormField>
                            <FormField first={false}>
                                <CollectionSelect value={store.dashboard.projectFilterValue}
                                    label="Project"
                                    onChange={this.onProjectFilterChange}
                                    items={
                                        Array.from(store.config.projects.docs.values())
                                            .map(doc => ({ name: doc.data!.name, id: doc.id }))
                                    }>
                                </CollectionSelect>
                            </FormField>
                        </FlexGroup>
                        {userFilter}
                    </FlexGroup>

                    <FlexGroup style={{ flexWrap: "wrap" }}>
                        <RegistrationsChart {...projectChartProps}>
                        </RegistrationsChart>
                        <RegistrationsChart {...taskChartProps}>
                        </RegistrationsChart>
                        {registrationsPerUserChart}
                    </FlexGroup>
                </Box>
            </>
        );
    }

    componentDidMount() {
        store.dashboard.setUserFilter(undefined);
        store.dashboard.setTaskFilter(undefined);
        store.dashboard.setProjectFilter(undefined);
    }

    componentWillUnmount() {
        this.getUsersReactionDisposer && this.getUsersReactionDisposer();
    }

    onTimePeriodechange(value: TimePeriod) {
        store.dashboard.setTimePeriodFilter(value);
    }

    onProjectFilterChange(value: string) {
        store.dashboard.setProjectFilter(value);
    }

    onUserFilterChange(value: string) {
        store.dashboard.setUserFilter(value);
    }

    onTaskFilterChange(value: string) {
        store.dashboard.setTaskFilter(value);
    }
}
