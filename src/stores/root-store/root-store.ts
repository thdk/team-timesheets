import { RouterStore } from "mobx-router";
import type firebase from "firebase";

import { IRegistrationsStore, RegistrationStore } from "../registration-store/registration-store";
import { IConfigStore, ConfigStore } from "../config-store";
import { UserStore } from "../user-store";
import { IViewStore, ViewStore } from "../view-store";
import { IReportStore, ReportStore } from "../report-store/report-store";
import { DashboardStore, IDashboardStore } from "../dashboard-store";
import { ProjectStore } from "../project-store";
import { FavoriteStore } from "../favorite-store";
import { DivisionStore } from "../division-store/division-store";
import { IUserData, IUser } from "../../../common";
import * as deserializer from "../../../common/serialization/deserializer";
import * as serializer from "../../../common/serialization/serializer";
import { FetchMode, RealtimeMode, AuthStore } from "firestorable";
import { TaskStore } from "../task-store";

export interface IRootStore extends Store { };

export class Store implements IRootStore {
    public readonly timesheets: IRegistrationsStore;
    public readonly view: IViewStore;
    public readonly auth: AuthStore<IUser, IUserData>;
    public readonly user: UserStore;
    public readonly config: IConfigStore;
    public readonly router: RouterStore<IRootStore>;
    public readonly reports: IReportStore;
    public readonly dashboard: IDashboardStore;
    public readonly projects: ProjectStore;
    public readonly favorites: FavoriteStore;
    public readonly divisions: DivisionStore;
    public readonly tasks: TaskStore;

    constructor({
        auth,
        firestore,
        httpsCallable,
    }: {
        firestore: firebase.firestore.Firestore,
        httpsCallable?: (name: string) => firebase.functions.HttpsCallable,
        auth?: firebase.auth.Auth,
    }) {
        this.auth = new AuthStore(
            {
                firestore,
                auth,
            },
            {
                collection: "users",
                collectionOptions: {
                    deserialize: deserializer.convertUser,
                    serialize: serializer.convertUser,
                    fetchMode: FetchMode.manual,
                    realtimeMode: RealtimeMode.on,
                    defaultSetOptions: {
                        merge: true,
                    }
                },
                createNewDocumentDefaults: (user) => {
                    const defaults = {
                        roles: {
                            recruit: true,
                        },
                        tasks: new Map(),
                        recentProjects: [],
                    };

                    return {
                        ...defaults,
                        ...user,
                    };
                },
            },
            {
                patchExistingUser: async (userDoc, usersCollection, fbUser) => {
                    if (!userDoc.data!.uid || !userDoc.data!.email) {
                        // backwords compatibility, get single user by id and patch user data
                        await usersCollection.updateAsync(
                            {
                                email: fbUser.email || "",
                                uid: fbUser.uid,
                            },
                            fbUser.uid,
                        );
                    }
                    return userDoc;
                },
                onSignOut: () => {
                    if (typeof gapi !== "undefined") {
                        const authInstance = gapi.auth2.getAuthInstance();
                        authInstance && authInstance.signOut();
                    }
                }
            }
        );

        this.user = new UserStore(
            this,
            {
                firestore,
            }
        );

        this.divisions = new DivisionStore(
            this,
            {
                firestore,
                httpsCallable,
            },
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
        this.router = new RouterStore<IRootStore>(this);

        this.tasks = new TaskStore(
            this,
            {
                firestore,
            },
        );
    }

    public dispose() {
        this.config.dispose();
        // this.dashboard.dispose();
        this.favorites.dispose();
        this.projects.dispose();
        this.tasks.dispose();
        // this.reports.dispose();
        this.divisions.dispose();
        this.timesheets.dispose();
        this.user.dispose();
        // this.view.dispose();
    }
};
