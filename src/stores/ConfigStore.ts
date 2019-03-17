import { observable, computed } from 'mobx';
import { Collection, ICollection } from "firestorable";
import { IRootStore } from './RootStore';
import { IProject, ITask, IClient, ITeam } from '../../common/dist';
import { firestore } from '../firebase/myFirebase';

export interface IConfigStore {
    projects: ICollection<IProject>;
    tasks: ICollection<ITask>;
    clientsCollection: ICollection<IClient>;
    teamsCollection: ICollection<IClient>;
    clients: (IClient & {id: string})[];
    teams: (ITeam & {id: string, isSelected: boolean})[];
    taskId?: string;
    projectId?: string;
    clientId?: string;
    teamId?: string;
}

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;

    readonly projects: ICollection<IProject>;
    readonly tasks: ICollection<IProject>;
    readonly clientsCollection: ICollection<IClient>;
    readonly teamsCollection: ICollection<ITeam>;

    @observable.ref taskId?: string;
    @observable.ref projectId?: string;
    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;
        this.projects = observable(new Collection<IProject>(firestore, getCollection.bind(this, "projects"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.tasks = observable(new Collection<ITask>(firestore, getCollection.bind(this, "tasks"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.clientsCollection = observable(new Collection<ITask>(firestore, getCollection.bind(this, "clients"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.teamsCollection = observable(new Collection<ITeam>(firestore, getCollection.bind(this, "teams"), {
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