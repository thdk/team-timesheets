import { IRegistrationsStore, RegistrationStore } from "./registration-store";
import { IConfigStore, ConfigStore } from "./config-store";
import { IUserStore, UserStore } from "./user-store";
import { IViewStore, ViewStore } from "./view-store";
import { RouterStore } from "mobx-router";
import { IReportStore, ReportStore } from "./report-store";
import { DashboardStore, IDashboardStore } from "./dashboard-store";
import { IProjectStore, ProjectStore } from "./project-store";

export interface IRootStore {

    readonly user: IUserStore;
    readonly view: IViewStore;
    readonly router: RouterStore;
    readonly timesheets: IRegistrationsStore;
    readonly reports: IReportStore;
    readonly config: IConfigStore;
    readonly projects: IProjectStore;
}

export class Store implements IRootStore {
    public readonly timesheets: IRegistrationsStore;
    public readonly view: IViewStore;
    public readonly user: IUserStore;
    public readonly config: IConfigStore;
    public readonly router = new RouterStore();
    public readonly reports: IReportStore;
    public readonly dashboard: IDashboardStore;
    public readonly projects: IProjectStore;

    constructor() {
        this.user = new UserStore(this);
        this.view = new ViewStore(this);
        this.config = new ConfigStore(this);
        this.timesheets = new RegistrationStore(this);
        this.reports = new ReportStore(this);
        this.dashboard = new DashboardStore(this);
        this.projects = new ProjectStore(this);
    }
};

const store = (window as any)["store"] = new Store();

export default store;

