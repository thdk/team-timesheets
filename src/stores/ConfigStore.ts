import { observable, computed, IObservableArray, action, IObservableValue } from 'mobx';
import { Collection, ICollection } from "firestorable";
import { IRootStore } from './RootStore';
import { firestore } from '../firebase/myFirebase';
import { IProject, ITask, IClient, IClientData, ITeam, ITeamData, IProjectData, ITaskData } from '../../common/dist';

import * as serializer from '../../common/serialization/serializer';
import * as deserializer from '../../common/serialization/deserializer';

export interface IConfigStore {
    projects: ICollection<IProject, IProjectData>;
    activeProjects: IObservableArray<IProject & { id: string }>;
    archivedProjects: IObservableArray<IProject & { id: string }>;
    archiveProject: (id?: string) => void;
    unarchiveProject: (id?: string) => void;
    setSelectedProject: (id?: string) => void;
    tasks: ICollection<ITask, ITaskData>;
    clientsCollection: ICollection<IClient>;
    teamsCollection: ICollection<ITeam, ITeamData>;
    clients: (IClient & { id: string })[];
    teams: (ITeam & { id: string, isSelected: boolean })[];
    taskId?: string;
    project: IObservableValue<(IProject & { id: string }) | undefined>;
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
    public project: IObservableValue<(IProject & { id: string }) | undefined>;
    @observable.ref clientId?: string;
    @observable.ref teamId?: string;

    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;
        this.projects = observable(new Collection<IProject, IProjectData>(firestore, getCollection.bind(this, "projects"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive"),
            serialize: serializer.convertProject,
            deserialize: deserializer.convertProject
        }));

        this.tasks = observable(new Collection<ITask, ITaskData>(firestore, getCollection.bind(this, "tasks"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive")
        }));

        this.clientsCollection = observable(new Collection<IClient, IClientData>(firestore, getCollection.bind(this, "clients"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive")
        }));

        this.teamsCollection = observable(new Collection<ITeam, ITeamData>(firestore, getCollection.bind(this, "teams"), {
            realtime: true,
            query: ref => ref.orderBy("name_insensitive")
        }));

        this.project = observable.box(undefined);
    }

    public archiveProject(id?: string) {
        const project = this.project.get();
        const projectId = id || (project && project.id);
        projectId && this.projects.updateAsync(projectId, { isArchived: true }).then(() => {
            this.setSelectedProject(undefined);
        });
    }

    public unarchiveProject(id?: string) {
        const project = this.project.get();
        const projectId = id || (project && project.id);
        projectId && this.projects.updateAsync(projectId, { isArchived: false }).then(() => {
            this.setSelectedProject(undefined);
        });
    }

    @action
    public setSelectedProject(id?: string) {
        if (id) {
            const projectData = this.projects.docs.get(id);
            if (!projectData || !projectData.data) throw new Error("Can't set selected project. No project found for id: " + id);

            this.project.set({ ...projectData.data, id });
        } else {
            this.project.set(undefined);
        }
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
    public get activeProjects() {
        return observable(Array.from(this.projects.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => !p.isArchived));
    }

    @computed
    public get archivedProjects() {
        return observable(Array.from(this.projects.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => p.isArchived));
    }
}