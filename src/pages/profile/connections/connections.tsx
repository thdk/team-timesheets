import React from "react";
import { ListDivider } from "@rmwc/list";

import { Box } from "../../../components/layout/box";
import { GithubSettings } from "../../../containers/github-settings";
import { GoogleCalendarSettings } from "../../../containers/google-calendar-settings";

export const Connections = () => {
    return (
        <Box>
            <GoogleCalendarSettings />

            <ListDivider
                style={{
                    margin: "1em 0 1em 0"
                }}
            />

            <GithubSettings />
            
        </Box>
    );
};
