import { Collection, ICollection, RealtimeMode, FetchMode } from "firestorable";
import { observable, action, transaction, computed } from "mobx";

import { IRootStore } from '../root-store';
import { IProject, IProjectData } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';

export interface IProjectStore extends ProjectStore {};

export class ProjectStore implements IProjectStore {
    private readonly rootStore: IRootStore;
    private _project = observable.box<Partial<IProject> | undefined>();

    readonly projectsCollection: ICollection<IProject, IProjectData>;

    // public project: IObservableValue<(IProject & { id: string }) | undefined>;
    @observable.ref projectId?: string;

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: firebase.firestore.Firestore,
        }
        ) {
        this.rootStore = rootStore;
        this.projectsCollection = new Collection<IProject, IProjectData>(
            firestore,
            "projects",
            {
                realtimeMode: RealtimeMode.on,
                fetchMode: FetchMode.once,
                query: ref => ref.orderBy("name_insensitive"),
                serialize: serializer.convertProject,
                deserialize: deserializer.convertProject,

            },
            {
                // logger: console.log,
            },
        );
    }

    public archiveProjects(...projectIds: string[]) {
        projectIds.length && this.projectsCollection.updateAsync({ isArchived: true }, ...projectIds)
            .then(() => {
                this.setProjectId(undefined);
            });
    }

    public unarchiveProjects(...projectIds: string[]) {
        projectIds.length && this.projectsCollection.updateAsync({ isArchived: false }, ...projectIds)
            .then(() => {
                this.setProjectId(undefined);
            });
    }

    public deleteProjects(...ids: string[]) {
        ids.length && this.projectsCollection.updateAsync(null, ...ids);
    }

    public addProject(project: IProject, id?: string) {
        if (!project.createdBy) {
            throw new Error("The current authenticed user must be set on project when adding a new project.");
        }

        this.projectsCollection.addAsync(project, id);
    }

    public updateProject(project: Partial<IProject>, id: string) {
        this.projectsCollection.updateAsync(project, id);
    }

    @action
    public setProjectId(id?: string) {
        this.projectId = id;
    }

    @action
    public setDefaultProject(project?: Partial<IProject>) {
        const defaultProject: Partial<IProject> = {
            createdBy: this.rootStore.user.divisionUser?.id,
            divisionId: this.rootStore.user.divisionUser?.divisionId,
        };

        transaction(() => {
            this._project.set({ ...defaultProject, ...project });
            this.projectId = undefined;
        })
    }

    @computed
    public get project() {
        const projectId = this.projectId;
        if (projectId) {
            const doc = this.projectsCollection.get(projectId);
            return doc ? doc.data : undefined;
        } else {
            return this._project.get();
        }
    }

    @computed
    public get activeProjects() {
        return observable(Array.from(this.projectsCollection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => !p.isArchived && !p.deleted));
    }

    @computed
    public get archivedProjects() {
        return observable(Array.from(this.projectsCollection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => p.isArchived && !p.deleted));
    }
}