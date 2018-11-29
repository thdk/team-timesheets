import { observable } from 'mobx';
import { Firestorable } from './Firestorable/Firestorable';
import { ICollection, Collection, IDocument } from './Firestorable/Collection';
import { RouterStore } from 'mobx-router';

export interface CollectionMap {
    "books": IBook;
    "registrations": IRegistration;
}

export interface IBook extends IDocument {
    author: string;
    title: string;
}

export interface IRegistration extends IDocument {
    description: string;
    time: number;
    project: string;
}

const firestorable = new Firestorable();

export interface IViewStore { title: string, isDrawerOpen: boolean }

export interface IAppStore {
    books: ICollection<IBook>;
    registrations: ICollection<IRegistration>;
    view:IViewStore;
}

class Store implements IAppStore {
    @observable readonly books = new Collection<IBook>("books", firestorable.firestore, { realtime: true });
    @observable readonly registrations = new Collection<IRegistration>("registrations", firestorable.firestore, { realtime: true })
    @observable readonly view: IViewStore;
    router = new RouterStore();

    constructor() {
        this.view = {
            title: "",
            isDrawerOpen: false
        }
    }
};

const store = (window as any)["store"] = new Store();

export default store;

