import { useConfigs } from "../../stores/config-store";
import { useMemo } from "react";

export const useGoogleConfig = () => {
    const configs = useConfigs();

    // TODO: Create scope from user preferences settings
    const scope = "https://www.googleapis.com/auth/calendar.readonly";

    const config = useMemo(() => ({
        apiKey: configs.getConfigValue("googleAppId", false) || "",
        clientId: configs.getConfigValue("googleClientId", false) || "",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope,
    }), [configs]);

    return config;
};