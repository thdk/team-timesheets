import React from "react";
import { FlexGroup } from "../../components/layout/flex";
import { ReportDownloadLink } from "../report-download-link";

export const ReportDownload = () => {

    return (
        <FlexGroup
            direction={"vertical"}
            style={{ paddingRight: "1em", alignItems: "flex-end" }}
        >
            <ReportDownloadLink  />
        </FlexGroup>
    );
};