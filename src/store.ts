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

export interface IAppStore {
    books: ICollection<IBook>;
}

class Store implements IAppStore {
    @observable books = new Collection<IBook>("books", firestorable.firestore, { realtime: true });
    @observable registrations = new Collection<IRegistration>("registrations", firestorable.firestore, { realtime: true })
    router = new RouterStore();
};

const store = (window as any)["store"] = new Store();

export default store;

