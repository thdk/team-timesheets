import { observable, computed, reaction } from 'mobx';
import type firebase from "firebase";
import { Collection, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { IRootStore } from '../root-store';
import { IClient, IClientData, ITeam, ITeamData, IConfig, ConfigValue } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';

export interface IConfigStore extends ConfigStore { };

export class ConfigStore implements IConfigStore {
    readonly clientsCollection: ICollection<IClient>;
    readonly teamsCollection: ICollection<ITeam, ITeamData>;
    readonly configsCollection: Collection<IConfig>;

    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    private disposables: (() => void)[] = [];

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
            },
            {
                // logger: msg => console.log(msg),
            }
        )

        this.disposables.push(
            reaction(() => rootStore.user.divisionUser, (user) => {
                if (!user) {
                    this.teamsCollection.query = null;
                    this.clientsCollection.query = null;
                }
                else {
                    const query = (ref: firebase.firestore.CollectionReference) =>
                        ref.orderBy("name_insensitive")
                            .where("divisionId", "==", user.divisionId || "");

                    this.teamsCollection.query = query;
                    this.clientsCollection.query = query;

                    if (!this.teamsCollection.isFetched) {
                        this.teamsCollection.fetchAsync();
                    }

                    if (!this.clientsCollection.isFetched) {
                        this.clientsCollection.fetchAsync();
                    }
                }
            })
        );
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
        this.disposables.reverse().forEach((d) => d());
        this.clientsCollection.dispose();
        this.teamsCollection.dispose();
        this.configsCollection.dispose();
    }
}
