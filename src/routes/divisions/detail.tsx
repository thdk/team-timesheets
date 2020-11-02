import * as React from "react";
import { Route, RouterStore } from "mobx-router";

import { App } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { DivisionDetailPage } from "../../pages/division-detail";

export const goToDivision = (router: RouterStore<IRootStore>, id?: string) => {
    router.goTo(id ? routes.divisionDetail : routes.newDivision, { id });
};

const path = '/division';

const routes = {
    divisionDetail: new Route<IRootStore>({
        path: path + '/:id',
        component: <App><DivisionDetailPage /></App>,
        title: "Edit division",
    }),
    newDivision: new Route<IRootStore>({
        path,
        component: <App><DivisionDetailPage /></App>,
        title: "New division",
    }),
};

export default routes;
