import * as React from 'react';
import { IReactionDisposer, transaction, when } from 'mobx';
import { observer } from 'mobx-react';

import {
    IUserRegistrationsChartProps,
    ChartType,
    IRegistrationsChartProps,
    RegistrationsChart
} from '../../containers/registrations/chart';
import { FlexGroup } from '../../components/layout/flex';
import CollectionSelect from '../../components/collection-select';
import { Box } from '../../components/layout/box';
import { FormField } from '../../components/layout/form';
import { canReadUsers } from '../../rules/rules';
import { TimePeriodSelect, TimePeriod } from '../../components/time-period-select';
import { IProject, ITask } from '../../../common/dist';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../internal';
import { StoreContext } from '../../contexts/store-context';

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
class Dashboard extends React.Component {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    private getUsersReactionDisposer?: IReactionDisposer;

    constructor(props: any) {
        super(props);

        if (!this.context.dashboard.timePeriodFilterValue) {
            when(() => !!this.context.user.userId, () => {
                transaction(() => {
                    this.context.dashboard.setUserFilter(this.context.user.userId);
                    this.context.dashboard.setTimePeriodFilter(TimePeriod.ThisMonth);
                });
            });
        }
    }

    render() {
        if (this.context.dashboard.timePeriodFilterValue === undefined) return null;

        const userChartProps: IUserRegistrationsChartProps = {
            title: "Time / user",
            data: this.context.dashboard.registrationsGroupedByUser,
            labelCollection: this.context.user.usersCollection,
            getLabel: user => user.name,
            chart: ChartType.Bar
        };

        const projectChartProps: IRegistrationsChartProps<IProject> = {
            title: "Time / project",
            data: this.context.dashboard.registrationsGroupedByProject,
            labelCollection: this.context.projects.projectsCollection,
            getLabel: project => project.name,
            chart: ChartType.Doughnut
        };

        const taskChartProps: IRegistrationsChartProps<ITask> = {
            title: "Time / task",
            data: this.context.dashboard.registrationsGroupedByTask,
            labelCollection: this.context.config.tasks,
            getLabel: task => task.name,
            chart: ChartType.Doughnut
        };

        const userFilter = canReadUsers(this.context.user.authenticatedUser)
            ? <>
                <FlexGroup>
                    <FormField first={false}>
                        <CollectionSelect value={this.context.dashboard.userFilterValue}
                            label="User"
                            onChange={this.onUserFilterChange}
                            items={
                                this.context.user.usersCollection.docs
                                    .map(doc => ({ name: doc.data!.name, id: doc.id }))
                            }>
                        </CollectionSelect>
                    </FormField>
                </FlexGroup>
            </>
            : null;

        const registrationsPerUserChart = this.context.user.usersCollection.docs.length
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
                                    this.context.dashboard.timePeriodFilterValue}
                                    onChange={this.onTimePeriodechange}></TimePeriodSelect>
                            </FormField>
                            <FormField first={false}>
                                <CollectionSelect value={this.context.dashboard.projectFilterValue}
                                    label="Project"
                                    onChange={this.onProjectFilterChange}
                                    items={this.context.projects.activeProjects}>
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
        this.context.dashboard.setTaskFilter(undefined);
        this.context.dashboard.setProjectFilter(undefined);
    }

    componentWillUnmount() {
        this.getUsersReactionDisposer && this.getUsersReactionDisposer();
    }

    onTimePeriodechange(value: TimePeriod) {
        this.context.dashboard.setTimePeriodFilter(value);
    }

    onProjectFilterChange(value: string) {
        this.context.dashboard.setProjectFilter(value);
    }

    onUserFilterChange(value: string) {
        this.context.dashboard.setUserFilter(value);
    }

    onTaskFilterChange(value: string) {
        this.context.dashboard.setTaskFilter(value);
    }
}

export default withAuthentication(
    Dashboard,
    <RedirectToLogin />,
);
