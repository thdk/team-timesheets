import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '../../stores/user-store';
import { useViewStore } from '../../stores/view-store';
import { useFirebase } from '../../contexts/firebase-context';
import { reaction } from 'mobx';
import { useReportStore } from '../../stores/report-store';

export const ReportDownloadLink = observer(() => {
    const reportStore = useReportStore();
    const userStore = useUserStore();
    const view = useViewStore();
    const firebase = useFirebase();
    const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

    const reportDoc = reportStore.report;

    useEffect(() => {
        reportDoc?.watch();

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
                    const { authenticatedUserId: userId } = userStore;

                    firebase.storage().ref(`reports/${year}/${month}/${userId}.csv`).getDownloadURL()
                        .then(url => setReportUrl(url));
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
