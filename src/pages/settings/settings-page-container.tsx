import React from "react";
import { SettingsPage as PureSettingsPage } from "./settings-page";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../internal";

export default withAuthentication(PureSettingsPage, <RedirectToLogin />);