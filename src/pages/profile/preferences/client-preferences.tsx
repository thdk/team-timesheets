import React, { useCallback } from "react";

import { FormField } from "../../../components/layout/form";
import ClientSelect from "../../../containers/clients/select";
import { useUserStore } from "../../../contexts/user-context";
import { useClients } from "../../../contexts/client-context";
import { observer } from "mobx-react-lite";

export const ClientPreferences = observer(() => {
    const userStore = useUserStore();
    const clients = useClients();

    const {
        defaultClient = undefined,
    } = userStore.divisionUser || {};
    const defaultClientChanged = useCallback((defaultClient: string) => {
        userStore.updateDivisionUser({
            defaultClient
        });
    }, [userStore]);

    return clients.clients.length
        ? (
            <>
                <h3 className="mdc-typography--subtitle1">
                    Pick default client
            </h3>
                <FormField first={false}>
                    <ClientSelect
                        onChange={defaultClientChanged}
                        label="Default client"
                        value={defaultClient}
                    />
                </FormField>
            </>
        )
        : null;
});
