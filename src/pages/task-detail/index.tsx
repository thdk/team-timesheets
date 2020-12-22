import * as React from "react";

import { TaskDetail } from "../../containers/tasks/detail";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { useEffect } from "react";
import { useRouterStore } from "../../stores/router-store";
import { useTasks } from "../../contexts/task-context";
import { ITask } from "../../../common";
import { IViewAction } from "../../stores/view-store";
import { goToTasks } from "../../routes/tasks/list";
import { useViewStore } from "../../contexts/view-context";
import { transaction } from "mobx";
import { observer } from "mobx-react-lite";

export const TaskDetailPage = withAuthentication(
    observer(
        () => {
            const router = useRouterStore();
            const view = useViewStore();

            const tasks = useTasks().store;

            useEffect(() => {
                if (router.params?.id) {
                    tasks.setActiveDocumentId(router.params.id.toString());
                }
                else {
                    tasks.createNewDocument();
                }
            }, [router.params, tasks]);

            useEffect(
                () => {
                    const save = () => {
                        const isValidTask = (task?: Partial<ITask> | null): task is ITask => {
                            return !!task && !!task.name;
                        };

                        if (isValidTask(tasks.activeDocument)) {
                            router.params?.id
                                ? tasks.updateDocument(tasks.activeDocument, router.params.id.toString())
                                : tasks.addDocument(tasks.activeDocument);
                        }
                    };

                    const deleteAction: IViewAction = {
                        action: () => {
                            try {
                                tasks.activeDocumentId && tasks.deleteDocument(tasks.activeDocumentId);
                            } catch {
                                console.warn("couldn't delete the document");
                            }
                            goToTasks(router);
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true }
                    }

                    const saveAction: IViewAction = {
                        action: () => {
                            save();
                            goToTasks(router);
                        },
                        icon: { label: "Save", content: "save" },
                        shortKey: { key: "s", ctrlKey: true }
                    }

                    transaction(() => {
                        view.setActions([
                            saveAction,
                            deleteAction
                        ]);

                        view.setNavigation({
                            action: () => {
                                save();
                                goToTasks(router);
                            },
                            icon: { label: "Back", content: "arrow_back" }
                        });

                        view.title = tasks.activeDocumentId
                            ? "Task detail"
                            : "New task";
                    });

                    return () => {
                        view.setActions([]);
                    };
                },
                [view, tasks, goToTasks, tasks.activeDocumentId, router],
            );

            return (
                <TaskDetail />
            );
        }
    ),
    <RedirectToLogin />
);
