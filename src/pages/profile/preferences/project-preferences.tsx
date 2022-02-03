import React, { useCallback } from "react";

import { FormField } from "../../../components/layout/form";
import { useUserStore } from "../../../contexts/user-context";
import { observer } from "mobx-react-lite";
import { Select } from "@rmwc/select";
import { ChangeEvent } from "react";
import { ProjectSelect } from "../../../containers/projects/select";
import { FlexGroup } from "../../../components/layout/flex";

export const ProjectPreferences = observer(() => {
    const userStore = useUserStore();

    const {
        numberOfRecentProjects = 5,
    } = userStore.divisionUser || {};

    const numberOfRecentProjectsChanged = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        userStore.updateDivisionUser({
            numberOfRecentProjects: +event.target.value,
        });
    }, [userStore]);

    const onDefaultProjectChanged = useCallback(
        (projectId) => {
            userStore.updateDivisionUser({
                defaultProjectId: projectId,
            });
        },
        [userStore]
    )

    return userStore.divisionUser
        ? (
            <>
                <h3 className="mdc-typography--subtitle1">
                    Project preferences
                </h3>
                <FlexGroup>
                    <FormField
                        first
                    >
                        <ProjectSelect
                            value={userStore.divisionUser?.defaultProjectId}
                            onChange={onDefaultProjectChanged}
                            label={"Default project"}
                        />
                    </FormField>
                    <FormField
                        first={false}
                    >
                        <Select
                            outlined
                            value={numberOfRecentProjects.toString()}
                            onChange={numberOfRecentProjectsChanged}
                            label="# of recent projects"
                            role="combobox"
                            name="recentProjects"
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                            <option value={9}>9</option>
                            <option value={10}>10</option>
                            <option value={11}>11</option>
                            <option value={12}>12</option>
                        </Select>
                    </FormField>
                </FlexGroup>
            </>
        )
        : null;
});
