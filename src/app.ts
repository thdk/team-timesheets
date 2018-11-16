import { IDocument, Firestorable, Collection, ICollection } from "./Firestorable";
import {observable} from "mobx";
import ReactDOM from "react-dom";
import { Library } from "./components/Library";
import React from 'react';

export interface CollectionMap {
    "books": IBook;
}

export interface IBook extends IDocument {
    author: string;
    title: string;
}
const firestorable = new Firestorable();

// firestorable.addAsync("books", { author: "test", title: "title" })
//     .then(() => firestorable.getAsync("books").then(books => {
//         books.forEach(book => {
//             console.log(`${book.author} - ${book.title}`);
//         });
//     })
//     );



export interface IAppStore {
    books: ICollection<IBook>;
}

class Store implements IAppStore {
    @observable books = new Collection<IBook>("books", firestorable.firestore)
};

const store = new Store();
ReactDOM.render(React.createElement(Library, store), document.getElementById("root"));

store.books.getAsync().then(() => {
    (window as any)["store"] = store;
});