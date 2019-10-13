import { observable, computed } from 'mobx';
import { Collection, ICollection } from "firestorable";
import { IRootStore } from './RootStore';
import { firestore } from '../firebase/myFirebase';
import { IProject, ITask, IClient, IClientData, ITeam, ITeamData, ITaskData } from '../../common/dist';

import * as serializer from '../../common/serialization/serializer';
import * as deserializer from '../../common/serialization/deserializer';

export interface IConfigStore {
    tasks: ICollection<ITask, ITaskData>;
    clientsCollection: ICollection<IClient>;
    teamsCollection: ICollection<ITeam, ITeamData>;
    clients: (IClient & { id: string })[];
    teams: (ITeam & { id: string, isSelected: boolean })[];
    taskId?: string;
    clientId?: string;
    teamId?: string;
}

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;
    readonly tasks: ICollection<IProject, ITaskData>;
    readonly clientsCollection: ICollection<IClient>;
    readonly teamsCollection: ICollection<ITeam, ITeamData>;

    @observable.ref taskId?: string;
    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;

        this.tasks = observable(new Collection<ITask, ITaskData>(firestore, getCollection.bind(this, "tasks"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive"),
            serialize: serializer.convertNameWithIcon,
            deserialize: deserializer.convertNameWithIcon,
        }));

        this.clientsCollection = observable(new Collection<IClient, IClientData>(firestore, getCollection.bind(this, "clients"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive"),
            serialize: serializer.convertNameWithIcon,
            deserialize: deserializer.convertNameWithIcon,
        }));

        this.teamsCollection = observable(new Collection<ITeam, ITeamData>(firestore, getCollection.bind(this, "teams"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive"),
            serialize: serializer.convertNameWithIcon,
            deserialize: deserializer.convertNameWithIcon,
        }));
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
}