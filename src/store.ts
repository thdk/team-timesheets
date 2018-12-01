import { observable, computed } from 'mobx';
import { Firestorable } from './Firestorable/Firestorable';
import { ICollection, Collection, IDocument } from './Firestorable/Collection';
import { RouterStore } from 'mobx-router';
import moment from 'moment-es6';

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

export interface IViewStore {
    title: string;
    isDrawerOpen: boolean;
    day: number;
    month: number;
    year: number;
}

export interface IAppStore {
    registrations: ICollection<IRegistration>;
    view: IViewStore;
    router: RouterStore;
}

class Store implements IAppStore {
    @observable readonly registrations = new Collection<IRegistration>("registrations", firestorable.firestore, { realtime: true })
    @observable readonly view: IViewStore;
    router = new RouterStore();

    constructor() {
        const date = new Date();

        this.view = observable({
            title: "",
            isDrawerOpen: false,
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
        });
    }

    @computed get moment() {
        return moment(new Date(this.view.year, this.view.month - 1, this.view.day));
    }
};

const store = (window as any)["store"] = new Store();

export default store;

