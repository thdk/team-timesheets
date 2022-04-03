import { RealtimeMode, FetchMode, CrudStore } from "firestorable";
import { observable, computed, reaction, makeObservable } from "mobx";

import { IRootStore } from '../root-store';
import { IProject, IProjectData, IUser } from '../../../common/dist';

import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { CollectionReference, Firestore, orderBy, query, where } from "firebase/firestore";

const createQuery = (user: IUser | undefined) => {
    if (!user) {
        return null;
    }
    else {
        return (ref: CollectionReference<IProjectData>) =>
            query(
                ref,
                orderBy("name_insensitive"),
                where("divisionId", "==", user.divisionId),
            );
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
            firestore: Firestore,
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

        makeObservable(this, {
            activeProjects: computed,
            archivedProjects: computed
        });

        this.rootStore = rootStore;

        this.disposables.push(
            reaction(() => rootStore.user.divisionUser, (user) => {
                this.collection.query = createQuery(user);
            })
        );
    }

    public archiveProjects(...projectIds: string[]) {
        projectIds.length && Promise.all(projectIds.map((projectId) => this.collection.updateAsync({ isArchived: true }, projectId)))
            .then(() => {
                this.setActiveDocumentId(undefined);
            });
    }

    public unarchiveProjects(...projectIds: string[]) {
        projectIds.length && Promise.all(projectIds.map((projectId) => this.collection.updateAsync({ isArchived: false }, projectId)))
            .then(() => {
                this.setActiveDocumentId(undefined);
            });
    }

    public async deleteProjects(...ids: string[]) {
        ids.length && await Promise.all(ids.map((id) => this.collection.updateAsync(null, id)));
    }

    public addDocument(project: IProject, id?: string) {
        // if (!project.createdBy) {
        //     throw new Error("The current authenticed user must be set on project when adding a new project.");
        // }

        return super.addDocument(project, id);
    }

    public get activeProjects() {
        return observable(Array.from(this.collection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }))
            .filter(p => !p.isArchived && !p.deleted));
    }

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