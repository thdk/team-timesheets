import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../contexts/store-context';
import { useUserStore } from '../../stores/user-store';
import { useViewStore } from '../../stores/view-store';
import { useFirebase } from '../../contexts/firebase-context/firebase-context';
import { reaction } from 'mobx';

export const ReportDownloadLink = observer(() => {
    const store = useStore();

    const reportDoc = store.reports.report;
    const userStore = useUserStore();
    const view = useViewStore();
    const firebase = useFirebase();
    const [reportUrl, setReportUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        reportDoc?.watch();

        return () => {
            reportDoc?.unwatch();
        };
    }, [reportDoc]);

    if (!reportDoc || !reportDoc.data) {
        return null;
    }


    reaction(
        () => reportDoc.data!.status, (status: string) => {
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

    return <>
        {
            reportUrl
                ? (
                    <a href={reportUrl}>
                        Download report
                    </a>
                )
                : reportDoc.data
                    ? reportDoc.data.status
                    : ""
        }
    </>;
});