import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useUserStore } from "../../contexts/user-context";
import { useViewStore } from '../../contexts/view-context';
import { reaction } from 'mobx';
import { useReportStore } from '../../stores/report-store';
import { usePromise } from "react-use";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

export const ReportDownloadLink = observer(() => {
    const reportStore = useReportStore();
    const userStore = useUserStore();
    const view = useViewStore();
    const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

    const reportDoc = reportStore.report;

    const resolveIfMounted = usePromise();

    useEffect(() => {
        if (reportDoc) {
            setReportUrl(undefined);
            reportDoc.watch();
        }

        return () => {
            reportDoc?.unwatch();
        };
    }, [reportDoc]);

    useEffect(() => {
        if (!reportDoc) {
            return;
        }

        return reaction<"waiting" | "error" | "complete" | undefined>(
            () => reportDoc.data?.status, (status: "waiting" | "error" | "complete" | undefined) => {
                if (status === "complete") {
                    const { month, year } = view;
                    const { divisionUser: user } = userStore;

                    resolveIfMounted(
                        getDownloadURL(ref(getStorage(), `reports/${year}/${month}/${user?.id}.csv`))
                    ).then(url => setReportUrl(url));
                }
            },
            {
                fireImmediately: true,
            },
        );
    }, [reportDoc]);

    if (!reportDoc || !reportDoc.data) {
        return <></>;
    }

    return <>
        {
            reportUrl
                ? (
                    <a href={reportUrl}
                    >
                        Download report
                    </a>
                )
                : reportDoc.data.status
        }
    </>;
});
