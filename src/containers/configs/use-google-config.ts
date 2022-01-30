import { useConfigStore } from "../../stores/config-store";

export const useGoogleConfig = () => {
    const configs = useConfigStore();

    // TODO: Create scope from user preferences settings
    const scope = "https://www.googleapis.com/auth/calendar.readonly";

    const config = {
        apiKey: configs.getConfigValue("googleAppId", false) || "",
        clientId: configs.getConfigValue("googleClientId", false) || "",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope,
    };

    return config;
};