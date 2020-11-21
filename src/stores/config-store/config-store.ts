import { observable, computed, action, reaction } from 'mobx';
import { Collection, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from '../root-store';
import { IClient, IClientData, ITeam, ITeamData, ITaskData, IConfig, ConfigValue, ITask } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';

export interface IConfigStore extends ConfigStore { };

export class ConfigStore implements IConfigStore {
    readonly tasksCollection: ICollection<ITask, ITaskData>;
    readonly clientsCollection: ICollection<IClient>;
    readonly teamsCollection: ICollection<ITeam, ITeamData>;
    readonly configsCollection: Collection<IConfig>;

    @observable.ref private taskIdField?: string;
    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: firebase.firestore.Firestore,
        }
    ) {
        // this._rootStore = rootStore;
        const deps = {
            // logger: console.log
        };

        this.tasksCollection = new Collection<ITask, ITaskData>(
            firestore,
            "tasks",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
                serialize: serializer.convertTask,
                deserialize: deserializer.convertTask,
            },
            deps,
        );

        this.clientsCollection =
            new Collection<IClient, IClientData>(
                firestore,
                "clients",
                {
                    realtimeMode: RealtimeMode.on,
                    fetchMode: FetchMode.manual,
                    serialize: serializer.convertClient,
                    deserialize: deserializer.convertClient,
                },
                deps,
            );

        this.teamsCollection = new Collection<ITeam, ITeamData>(
            firestore,
            "teams",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.manual,
                serialize: serializer.convertTeam,
                deserialize: deserializer.convertTeam,
            },
            deps,
        );

        this.configsCollection = new Collection<IConfig>(
            firestore,
            "configs",
            {
                fetchMode: FetchMode.auto,
                realtimeMode: RealtimeMode.off,
            }
        )

        reaction(() => rootStore.user.divisionUser, (user) => {
            if (!user) {
                this.teamsCollection.query = null;
                this.tasksCollection.query = null;
                this.clientsCollection.query = null;
            }
            else {
                const query = (ref: firebase.firestore.CollectionReference) =>
                    ref.orderBy("name_insensitive")
                        .where("divisionId", "==", user.divisionId || "");

                this.teamsCollection.query = query;
                this.tasksCollection.query = query;
                this.configsCollection.query = query;
                this.clientsCollection.query = query;

                if (!this.teamsCollection.isFetched) {
                    this.teamsCollection.fetchAsync();
                }

                if (!this.tasksCollection.isFetched) {
                    this.tasksCollection.fetchAsync();
                }

                if (!this.clientsCollection.isFetched) {
                    this.clientsCollection.fetchAsync();
                }
            }

        });
    }

    @computed
    public get clients() {
        return Array.from(this.clientsCollection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }));
    }

    @computed
    public get teams() {
        return Array.from(this.teamsCollection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id, isSelected: doc.id === this.teamId }));
    }

    @computed
    public get tasks() {
        return Array.from(this.tasksCollection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }));
    }

    @computed
    public get taskId() {
        return this.taskIdField;
    }

    @action
    public setTaskId(id: string | undefined) {
        this.taskIdField = id;
    }

    // To investigate: does getConfigValue needs mobx @computed attribute?
    public getConfigValue<T = string>(key: string): T;
    public getConfigValue<T = string>(key: string, isRequired: true): T;
    public getConfigValue<T = string>(key: string, isRequired: boolean): T | undefined;
    public getConfigValue<T extends ConfigValue>(key: string, isRequired = true): T | undefined {
        const doc = this.configsCollection.docs.find(c => c.data!.key === key);

        if (!doc) {
            if (isRequired) throw new Error(`Required config '${key}' is missing.`);
            else return undefined;
        }

        return doc.data!.value as unknown as T;
    }

    public dispose() {
        this.clientsCollection.dispose();
        this.teamsCollection.dispose();
        this.tasksCollection.dispose();
        this.configsCollection.dispose();
    }
}
