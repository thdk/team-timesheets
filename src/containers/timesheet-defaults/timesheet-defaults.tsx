import { IconButton } from "@rmwc/icon-button";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { FlexGroup } from "../../components/layout/flex";
import { useUserStore } from "../../contexts/user-context";
import { ProjectSelect } from "../projects/select";

export const TimesheetDefaults = observer(() => {
    const userStore = useUserStore();

    const onDefaultProjectChanged = useCallback(
        (projectId) => {
            userStore.updateDivisionUser({
                defaultProjectId: projectId,
            });
        },
        [userStore]
    );

    return (
        <FlexGroup
            style={{
                padding: "1em",
                paddingRight: "2em",
                alignItems: "center",
            }}
        >
            <ProjectSelect
                value={userStore.divisionUser?.defaultProjectId}
                onChange={onDefaultProjectChanged}
                label={"Active project"}
            />
            <IconButton
                icon="clear"
                onClick={() => userStore.updateDivisionUser({ defaultProjectId: undefined })}
            />
        </FlexGroup>
    );
});
