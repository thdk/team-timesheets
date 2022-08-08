import React from 'react';
import { observer } from 'mobx-react-lite';

import { Box } from '../../../components/layout/box';

import { useUserStore } from "../../../contexts/user-context";
import { TaskPreferences } from './task-preferences';
import { ClientPreferences } from './client-preferences';
import { ProjectPreferences } from './project-preferences';
import { useTasks } from '../../../contexts/task-context';
import { useClients } from '../../../contexts/client-context';
import { useProjectStore } from '../../../contexts/project-context';
import { ThemePreferences } from './theme-preferences';

export const Preferences = observer(() => {
    const userStore = useUserStore();
    const tasks = useTasks();
    const clients = useClients();
    const projects = useProjectStore();

    if (!userStore.divisionUser) {
        return <></>;
    }

    if (
        (tasks.collection.isFetched && !tasks.tasks.length)
        && (clients.clientsCollection.isFetched && !clients.clients.length)
        && (projects.collection.isFetched && !projects.collection.docs.length)
    ) {
        return (
            <Box>
                <h3 className="mdc-typography--subtitle1">
                    Your division has not been fully configured yet. Add some tasks from the settings page or ask you division manager to set this up.
                </h3>
            </Box>
        );
    }

    return (
        <>
            <Box>
                <TaskPreferences />
                <ClientPreferences />
                <ProjectPreferences />
                <ThemePreferences />
            </Box>
        </>
    );
});
