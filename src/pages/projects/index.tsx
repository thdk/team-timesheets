import * as React from 'react'
import { observer } from 'mobx-react-lite';
import { Tab, TabBar } from "@rmwc/tabs";

import { ProjectsTab, goToProjects, ProjectRouteQueryParams } from '../../routes/projects/list';
import { ActiveProjectList, ArchivedProjectList } from '../../containers/projects/list';
import { useRouterStore } from '../../stores/router-store';
import { where, limit } from 'firebase/firestore';
import { transaction } from 'mobx';
import { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';
import routes from '../../routes/projects/detail';
import { useEffect } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { useRegistrationStore } from '../../contexts/registration-context';
import { useViewStore } from '../../contexts/view-context';

interface ITabData {
    id: ProjectsTab;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

export const getActions = (tab: ProjectsTab, store: Pick<IRootStore, "view" | "router" | "projects" | "timesheets">) => {

    const deleteAction: IViewAction = {
        action: (selection) => {
            if (!selection) {
                return;
            }

            store.timesheets.collection.queryAsync(
                where("project", "in", Array.from(selection.keys())),
                limit(1),
            ).then((projectRegistrations) => {
                if (!projectRegistrations.length) {
                    selection.size && store.projects.deleteProjects(...selection.keys());
                    selection.clear();
                } else {
                    // TODO: show toast that projects with registrations cannot be deleted
                }
            });
        },
        icon: { label: "Delete", content: "delete" },
        shortKey: { key: "Delete", ctrlKey: true },
        contextual: true,
        selection: store.view.selection,
        selectionLimit: 10,
    };

    const actions = [
        deleteAction,
    ];

    switch (tab) {
        case "active":
            const archiveAction: IViewAction = {
                action: () => {
                    store.projects.archiveProjects(...store.view.selection.keys());
                    store.view.selection.clear();
                },
                icon: { label: "Archive", content: "archive" },
                shortKey: { key: "e" },
                contextual: true,
                selection: store.view.selection,
            };

            actions.push(archiveAction);

            break;

        case "archived":
            const unarchiveAction: IViewAction = {
                action: () => {
                    store.projects.unarchiveProjects(...store.view.selection.keys());
                    store.view.selection.clear();
                },
                icon: { label: "Unarchive", content: "unarchive" },
                contextual: true,
                shortKey: { key: "e" },
                selection: store.view.selection,
            };

            actions.push(unarchiveAction);

            break;
    }

    return actions;
}

export const ProjectsPage = observer(() => {
    const router = useRouterStore();
    const projectsStore = useProjectStore();
    const timesheetsStore = useRegistrationStore();
    const viewStore = useViewStore();

    const tabData: ITabData[] = [
        {
            id: "active",
            text: "Active projects",
            tabContent: <ActiveProjectList />,
        },
        {
            id: "archived",
            text: "Archived projects",
            tabContent: <ArchivedProjectList />,
        },
    ];

    const query: { tab: ProjectsTab } = router.queryParams as ProjectRouteQueryParams;
    const { tab: activeTabId = tabData[0].id } = query || {};

    const activeTabIndex = tabData.findIndex(t => t.id === activeTabId) || 0;

    const tabs = tabData.map(({ id, icon, text }) => {
        return <Tab
            onClick={goToProjects.bind(null, router, id)}
            iconIndicator={icon}
            key={id}
        >
            {text}
        </Tab>;
    });

    useEffect(
        () => {
            (async () => {
                await Promise.resolve();
                transaction(() => {
                    viewStore.setActions(
                        getActions(activeTabId, {
                            projects: projectsStore,
                            timesheets: timesheetsStore,
                            view: viewStore,
                            router: router,
                        })
                    );
                    viewStore.setFabs([{
                        action: () => {
                            router.goTo(routes.newProject, {});
                        },
                        icon: {
                            content: "add",
                            label: "New project"
                        },
                        shortKey: {
                            key: "a",
                        },
                    }]);
                });

                return () => {
                    transaction(() => {
                        viewStore.setActions([]);
                        viewStore.setFabs([]);
                    });
                }
            })();
        },
        [
            viewStore,
        ],
    );

    return (
        <>
            <TabBar
                activeTabIndex={activeTabIndex}
            >
                {tabs}
            </TabBar>
            {tabData[activeTabIndex].tabContent}
        </>
    );
});
