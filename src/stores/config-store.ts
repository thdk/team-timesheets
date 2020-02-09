import { observable, computed } from 'mobx';
import { Collection, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from './root-store';
import { firestore } from '../firebase/my-firebase';
import { IProject, ITask, IClient, IClientData, ITeam, ITeamData, ITaskData, IConfig, ConfigValue } from '../../common/dist';

import * as serializer from '../../common/serialization/serializer';
import * as deserializer from '../../common/serialization/deserializer';
import { LoginProvider } from '../firebase/types';

export type Configs = {
    // authClientId: string;
    loginProviders: LoginProvider[];
}

export interface IConfigStore extends ConfigStore {};

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;
    readonly tasks: ICollection<IProject, ITaskData>;
    readonly clientsCollection: ICollection<IClient>;
    readonly teamsCollection: ICollection<ITeam, ITeamData>;
    readonly configsCollection: Collection<IConfig>;

    @observable.ref taskId?: string;
    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    constructor(_rootStore: IRootStore) {
        // this._rootStore = rootStore;
        const deps = { logger: console.log };

        this.tasks = new Collection<ITask, ITaskData>(
            firestore,
            "tasks",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.once,
                query: ref => ref.orderBy("name_insensitive"),
                serialize: serializer.convertNameWithIcon,
                deserialize: deserializer.convertNameWithIcon,
            },
            deps,
        );

        this.clientsCollection =
            new Collection<IClient, IClientData>(
                firestore,
                "clients",
                {
                    realtimeMode: RealtimeMode.on,
                    fetchMode: FetchMode.once,
                    query: ref => ref.orderBy("name_insensitive"),
                    serialize: serializer.convertNameWithIcon,
                    deserialize: deserializer.convertNameWithIcon,
                },
                deps,
            );

        this.teamsCollection = new Collection<ITeam, ITeamData>(
            firestore,
            "teams",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.once,
                query: ref => ref.orderBy("name_insensitive"),
                serialize: serializer.convertNameWithIcon,
                deserialize: deserializer.convertNameWithIcon,
            },
            deps,
        );

        this.configsCollection = new Collection<IConfig>(
            firestore,
            "configs",
            {
                fetchMode: FetchMode.once,
            }
        )
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

    // To investigate: does getConfigValue needs mobx @computed attribute?
    public getConfigValue<T>(key: string): T;
    public getConfigValue<T>(key: string, isRequired: false): T | undefined;
    public getConfigValue<T extends ConfigValue>(key: string, isRequired = true): T | undefined {
        const doc = this.configsCollection.docs.find(c => c.data!.key === key);

        if (!doc) {
            if (isRequired) throw new Error(`Required config '${key}' is missing.`);
            else return undefined;
        }

        return doc.data!.value as unknown as T;
    }
}
