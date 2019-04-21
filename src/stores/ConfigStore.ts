import { observable, computed } from 'mobx';
import { Collection, ICollection } from "../Firestorable/Collection";
import { IRootStore } from './RootStore';
import { IProject, ITask, IClient, ITeam, ITeamData, IProjectData, ITaskData } from '../../common/dist';

import * as serializer from '../../common/serialization/serializer';
import * as deserializer from '../../common/serialization/deserializer';

export interface IConfigStore {
    projects: ICollection<IProject, IProjectData>;
    tasks: ICollection<ITask, ITaskData>;
    clientsCollection: ICollection<IClient>;
    teamsCollection: ICollection<ITeam, ITeamData>;
    clients: (IClient & {id: string})[];
    teams: (ITeam & {id: string, isSelected: boolean})[];
    taskId?: string;
    projectId?: string;
    clientId?: string;
    teamId?: string;
}

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;

    readonly projects: ICollection<IProject, IProjectData>;
    readonly tasks: ICollection<IProject, ITaskData>;
    readonly clientsCollection: ICollection<IClient>;
    readonly teamsCollection: ICollection<ITeam, ITeamData>;

    @observable.ref taskId?: string;
    @observable.ref projectId?: string;
    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;
        this.projects = observable(new Collection<IProject, IProjectData>(getCollection.bind(this, "projects"), {
            realtime: true,
            query: ref => ref.orderBy("name"),
            serialize: serializer.convertProject,
            deserialize: deserializer.convertProject
        }));

        this.tasks = observable(new Collection<ITask, ITaskData>(getCollection.bind(this, "tasks"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.clientsCollection = observable(new Collection<ITask>(getCollection.bind(this, "clients"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.teamsCollection = observable(new Collection<ITeam, ITeamData>(getCollection.bind(this, "teams"), {
            realtime: true,
            query: ref => ref.orderBy("name")
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