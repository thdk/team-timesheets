import {observable} from 'mobx';
import { Firestorable } from './Firestorable/Firestorable';
import { ICollection, Collection, IDocument } from './Firestorable/Collection';

export interface CollectionMap {
    "books": IBook;
}

export interface IBook extends IDocument {
    author: string;
    title: string;
}

const firestorable = new Firestorable();

export interface IAppStore {
    books: ICollection<IBook>;
}

class Store implements IAppStore {
    @observable books = new Collection<IBook>("books", firestorable.firestore)
};

const store = (window as any)["store"] = new Store();

export default store;

