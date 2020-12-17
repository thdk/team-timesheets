import { RealtimeMode, FetchMode, CrudStore } from "firestorable";
import { observable, computed, reaction } from "mobx";
import type firebase from "firebase";

import { IRootStore } from '../root-store';
import { IProject, IProjectData, IUser } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';

const createQuery = (user: IUser | undefined) => {
    if (!user) {
        return null;
    }
    else {
        return (ref: firebase.firestore.CollectionReference) =>
            ref.orderBy("name_insensitive")
                .where("divisionId", "==", user.divisionId || "");
    }
}

export class ProjectStore extends CrudStore<IProject, IProjectData> {
    private readonly rootStore: IRootStore;

    private disposables: (() => void)[] = [];
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
                    query: createQuery(rootStore.user.divisionUser),
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

        this.disposables.push(
            reaction(() => rootStore.user.divisionUser, (user) => {
                this.collection.query = createQuery(user);
            })
        );
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

    public dispose() {
        super.dispose();
        this.disposables.reverse().forEach(d => d());
    }
}