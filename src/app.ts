import { IDocument, Firestorable } from "./Firestorable";

export interface CollectionMap {
    "books": IBook;
}

interface IBook extends IDocument {
    author: string;
    title: string;
}
const firestorable = new Firestorable();

firestorable.addAsync("books", { author: "test", title: "title" })
    .then(() => firestorable.getAsync("books").then(books => {
        books.forEach(book => {
            console.log(`${book.author} - ${book.title}`);
        });
    })
    );

(window as any)["firestorable"] = firestorable;