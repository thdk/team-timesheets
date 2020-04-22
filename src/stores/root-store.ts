import { RouterStore } from "mobx-router";

import { IRegistrationsStore, RegistrationStore } from "./registration-store/registration-store";
import { IConfigStore, ConfigStore } from "./config-store";
import { IUserStore, UserStore } from "./user-store";
import { IViewStore, ViewStore } from "./view-store";
import { IReportStore, ReportStore } from "./report-store";
import { DashboardStore, IDashboardStore } from "./dashboard-store";
import { IProjectStore, ProjectStore } from "./project-store";
import { FavoriteStore } from "./favorite-store";

export interface IRootStore {
    readonly user: IUserStore;
    readonly view: IViewStore;
    readonly router: RouterStore;
    readonly timesheets: IRegistrationsStore;
    readonly reports: IReportStore;
    readonly config: IConfigStore;
    readonly projects: IProjectStore;
    readonly favorites: FavoriteStore;
    readonly dashboard: IDashboardStore;
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
    public readonly favorites: FavoriteStore;

    constructor({
        auth,
        firestore,
        storage,
     }: {
        firestore: firebase.firestore.Firestore,
        auth: firebase.auth.Auth,
        storage: firebase.storage.Storage,
    }) {
        this.user = new UserStore(
            this,
            {
                auth,
                firestore,
            }
        );

        this.view = new ViewStore(this);
        this.config = new ConfigStore(
            this,
            {
                firestore,
            },
        );
        this.timesheets = new RegistrationStore(
            this,
            {
                firestore,
            },
        );
        this.reports = new ReportStore(
            this,
            {
                firestore,
                storage,
            },
        );
        this.dashboard = new DashboardStore(
            this,
            {
                firestore,
            },
        );
        this.projects = new ProjectStore(
            this,
            {
                firestore,
            },
        );
        this.favorites = new FavoriteStore(
            this,
            {
                firestore,
            },
        );
    }
};
