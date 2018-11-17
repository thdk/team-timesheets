import { Firestorable } from "./Firestorable/Firestorable";
import { observable } from "mobx";
import ReactDOM from "react-dom";
import React from 'react';
import { App } from "./components/App";
import { IDocument, ICollection, Collection } from "./Firestorable/Collection";

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

ReactDOM.render(React.createElement(App, Object.assign(store)), document.getElementById("root"));
