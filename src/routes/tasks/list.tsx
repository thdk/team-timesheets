import { RouterStore } from "mobx-router";
import { IRootStore } from "../../stores/root-store";
import { goToSettings } from "../settings";

export const goToTasks = (router: RouterStore<IRootStore>) => {
    goToSettings(router, "tasks");
}
