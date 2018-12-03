import { observable, computed } from 'mobx';
import { Firestorable } from './Firestorable/Firestorable';
import { ICollection, Collection, IDocument } from './Firestorable/Collection';
import { RouterStore } from 'mobx-router';
import moment from 'moment-es6';
import { IViewStore, ViewStore } from './stores/ViewStore';
import { IRegistration, IRegistrationsStore, RegistrationStore } from './stores/RegistrationStore';
import { IUserStore, UserStore } from './stores/UserStore';

export interface CollectionMap {
    "registrations": IRegistration;
    "tasks": ITask;
}

export interface ITask extends IDocument {
    name: string;
    color?: string;
    icon?: string;
}

const firestorable = new Firestorable();


export interface IRootStore {
    registrations: ICollection<IRegistration>;
    view: IViewStore;
    router: RouterStore;
    registrationsStore: IRegistrationsStore;
}

class Store implements IRootStore {
    @observable readonly registrations = new Collection<IRegistration>("registrations", firestorable.firestore, { realtime: true });
    @observable readonly tasks = new Collection<ITask>("tasks", firestorable.firestore, { realtime: true })
    readonly registrationsStore: IRegistrationsStore;
    readonly view: IViewStore;
    readonly user: IUserStore;
    router = new RouterStore();

    constructor() {
        this.view = new ViewStore(this);
        this.user = new UserStore(this);
        this.registrationsStore = new RegistrationStore(this);
        this.loadData();
    }

    loadData() {
        this.tasks.getDocs();
    }
};

const store = (window as any)["store"] = new Store();

export default store;

