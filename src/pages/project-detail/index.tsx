import * as React from "react";

import { observer } from "mobx-react-lite";
import ProjectDetailContainer from "../../containers/projects/detail";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { IRootStore } from "../../stores/root-store";
import { IProject } from "../../../common";
import { goToProjects, setTitleForRoute } from "../../internal";
import { transaction } from "mobx";
import routes from "../../routes/projects/detail";
import { limit, where } from "firebase/firestore";
import { IViewAction } from "../../stores/view-store";
import { useStore } from "../../contexts/store-context";
import { useEffect } from "react";

function setHeaderActions(s: IRootStore) {
    const save = () => {

        const isValidProject = (project?: Partial<IProject> | null): project is IProject => {
            return !!project && !!project.name;
        };

        if (isValidProject(s.projects.activeDocument)) {
            s.projects.activeDocumentId
                ? s.projects.updateDocument(s.projects.activeDocument, s.projects.activeDocumentId)
                : s.projects.addDocument(s.projects.activeDocument);
        }
    };
    const deleteAction: IViewAction = {
        action: () => {
            if (!s.projects.activeDocumentId) {
                return;
            }

            s.projects.deleteProjects(s.projects.activeDocumentId);
            goToProjects(s.router);
        },
        icon: { label: "Delete", content: "delete" },
        shortKey: { key: "Delete", ctrlKey: true }
    }

    const saveAction: IViewAction = {
        action: () => {
            save();
            goToProjects(s.router);
        },
        icon: { label: "Save", content: "save" },
        shortKey: { key: "s", ctrlKey: true }
    }

    if (s.projects.activeDocumentId) {
        s.timesheets.collection.queryAsync(
            where("project", "==", s.projects.activeDocumentId),
            limit(1),
        ).then((projectRegistrations) => {
            if (projectRegistrations.length) {
                return;
            }

            // this project has no registrations yet, add delete action to action list
            s.view.setActions([
                deleteAction,
                saveAction
            ]);
        });
    } else {
        transaction(() => {
            s.view.setActions([
                saveAction,
            ]);


            s.view.setNavigation({
                action: () => {
                    save();
                    goToProjects(s.router);
                },
                icon: { label: "Back", content: "arrow_back" }
            });

            setTitleForRoute(
                s,
                s.projects.activeDocumentId
                    ? routes.projectDetail
                    : routes.newProject
            );
        });
    }
}

const ProjectDetailPage = observer(() => {

    const store = useStore();
    useEffect(
        () => {
            setHeaderActions(store);
            return () => {
                transaction(() => {
                    store.view.setActions([]);
                    store.view.setFabs([]);
                });
            }
        },
        [],
    );

    return (
        <ProjectDetailContainer />
    );

});

export default withAuthentication(
    ProjectDetailPage,
    <RedirectToLogin />,
);
