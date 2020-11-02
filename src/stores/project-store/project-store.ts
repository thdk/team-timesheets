import { RealtimeMode, FetchMode } from "firestorable";
import { observable, computed } from "mobx";

import { IRootStore } from '../root-store';
import { IProject, IProjectData } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { FirestorableStore } from "../firestorable-store";

export class ProjectStore extends FirestorableStore<IProject, IProjectData> {
    private readonly rootStore: IRootStore;

    constructor(
        rootStore: IRootStore,
        {
            firestore,
        }: {
            firestore: firebase.firestore.Firestore,
        }
    ) {
        super(
            {
                collection: "projects",
                collectionOptions: {
                    realtimeMode: RealtimeMode.on,
                    fetchMode: FetchMode.once,
                    query: ref => ref.orderBy("name_insensitive"),
                    serialize: serializer.convertProject,
                    deserialize: deserializer.convertProject,
                },
                createNewDocumentDefaults: () => ({
                    createdBy: this.rootStore.user.divisionUser?.id,
                    divisionId: this.rootStore.user.divisionUser?.divisionId,
                }),
            },
            {
                firestore,
            },
        );
        this.rootStore = rootStore;
    }

    public archiveProjects(...projectIds: string[]) {
        projectIds.length && this.collection.updateAsync({ isArchived: true }, ...projectIds)
            .then(() => {
                this.setActiveDocumentId(undefined);
            });
    }

    public unarchiveProjects(...projectIds: string[]) {
        projectIds.length && this.collection.updateAsync({ isArchived: false }, ...projectIds)
            .then(() => {
                this.setActiveDocumentId(undefined);
            });
    }

    public deleteProjects(...ids: string[]) {
        ids.length && this.collection.updateAsync(null, ...ids);
    }

    public addDocument(project: IProject, id?: string) {
        if (!project.createdBy) {
            throw new Error("The current authenticed user must be set on project when adding a new project.");
        }

        return super.addDocument(project, id);
    }

    @computed
    public get activeProjects() {
        return observable(Array.from(this.collection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => !p.isArchived && !p.deleted));
    }

    @computed
    public get archivedProjects() {
        return observable(Array.from(this.collection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => p.isArchived && !p.deleted));
    }
}