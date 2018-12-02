import store from "../store";
import { Route } from "mobx-router";

export const setTitleForRoute = (route: Route) => {
    store.view.title = route.title || "";
}