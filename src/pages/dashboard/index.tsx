import * as React from 'react';
import { transaction, when } from 'mobx';
import { observer } from 'mobx-react-lite';

import {
    IUserRegistrationsChartProps,
    ChartType,
    IRegistrationsChartProps,
    RegistrationsChart
} from '../../containers/timesheet/chart';
import { FlexGroup } from '../../components/layout/flex';
import { CollectionSelect } from '../../components/collection-select';
import { Box } from '../../components/layout/box';
import { FormField } from '../../components/layout/form';
import { canReadUsers } from '../../rules';
import { TimePeriodSelect, TimePeriod } from '../../components/time-period-select';
import { IProject, IProjectData, ITask, ITaskData } from '../../../common/dist';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../internal';
import { useStore } from '../../contexts/store-context';
import { useEffect } from 'react';

export const chartColors = {
    blue: "rgb(54, 162, 235)",
    green: "rgb(75, 192, 192)",
    grey: "rgb(201, 203, 207)",
    orange: "rgb(255, 159, 64)",
    purple: "rgb(153, 102, 255)",
    red: "rgb(255, 99, 132)",
    yellow: "rgb(255, 205, 86)"
}

export const DashboardPage = withAuthentication(
    observer(
        () => {
            const store = useStore();

            useEffect(
                () => {
                    if (!store.dashboard.timePeriodFilterValue) {
                        when(() => !!store.user.divisionUser, () => {
                            transaction(() => {
                                store.dashboard.setUserFilter(store.user.divisionUser?.id);
                                store.dashboard.setTimePeriodFilter(TimePeriod.ThisMonth);
                            });
                        });
                    }
                },
                [store],
            );

            useEffect(
                () => {
                    store.dashboard.setTaskFilter(undefined);
                    store.dashboard.setProjectFilter(undefined);
                },
                [store]
            );

            const onTimePeriodechange = (value: TimePeriod) => {
                store.dashboard.setTimePeriodFilter(value);
            }

            const onProjectFilterChange = (value: string) => {
                store.dashboard.setProjectFilter(value);
            }

            const onUserFilterChange = (value: string) => {
                store.dashboard.setUserFilter(value);
            }

            if (store.dashboard.timePeriodFilterValue === undefined) {
                return null;
            }

            const userChartProps: IUserRegistrationsChartProps = {
                title: "Time / user",
                data: store.dashboard.registrationsGroupedByUser,
                labelCollection: store.user.usersCollection,
                getLabel: user => user.name,
                chart: ChartType.Bar
            };

            const projectChartProps: IRegistrationsChartProps<IProject, IProjectData> = {
                title: "Time / project",
                data: store.dashboard.registrationsGroupedByProject,
                labelCollection: store.projects.collection,
                getLabel: project => project.name,
                chart: ChartType.Doughnut
            };

            const taskChartProps: IRegistrationsChartProps<ITask, ITaskData> = {
                title: "Time / task",
                data: store.dashboard.registrationsGroupedByTask,
                labelCollection: store.tasks.collection,
                getLabel: task => task.name,
                chart: ChartType.Doughnut
            };

            const userFilter = canReadUsers(store.user.divisionUser)
                ? <>
                    <FlexGroup>
                        <FormField first={false}>
                            <CollectionSelect value={store.dashboard.userFilterValue}
                                id={"users-collection"}
                                label="User"
                                onChange={onUserFilterChange}
                                items={
                                    store.user.usersCollection.docs
                                        .map(doc => ({ label: doc.data!.name, value: doc.id }))
                                } />
                        </FormField>
                    </FlexGroup>
                </>
                : null;

            const registrationsPerUserChart = store.user.usersCollection.docs.length
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
                                        onChange={onTimePeriodechange}></TimePeriodSelect>
                                </FormField>
                                <FormField first={false}>
                                    <CollectionSelect
                                        id={"project-collection"}
                                        value={store.dashboard.projectFilterValue}
                                        label="Project"
                                        onChange={onProjectFilterChange}
                                        items={store.projects.activeProjects
                                            .map(({ id, name }) => ({ label: name, value: id }))
                                        } />
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
        }),
    <RedirectToLogin />
);
