import React from 'react';
import { observer } from "mobx-react";
import { IBook } from "../app";
import { ICollection } from '../Firestorable/Collection';

@observer
export class Library extends React.Component<{ books: ICollection<IBook> } & { delete: (id: string) => Promise<void> }> {
    private isRendered = false;
    render() {
        if (!this.isRendered) this.mount();
        return (
            <div>
                <ul>
                    {this.props.books.docs.map(
                        book => <BookView onclick={() => this.props.delete(book.id)} author={book.author} title={book.title} key={book.id} id={book.id} />
                    )}
                </ul>
            </div>);
    }

    remove(id: string) {
        this.props.delete(id);
    }

    mount() {
        this.isRendered = true;
        // to query the collection use:
        // this.props.books.getAsync(ref => ref.where("author", "==", "thdk"));
        this.props.books.getAsync();
    }
};

@observer
class BookView extends React.Component<IBook & { onclick: (id: string) => void }> {
    render() {
        const { author, title, id } = this.props;
        return (
            <li onClick={() => this.click(id)}>{author} - {title}</li>
        );
    }

    click(id: string) {
        this.props.onclick(id);
    }
}
