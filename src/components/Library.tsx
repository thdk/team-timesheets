import React from 'react';
import { observer } from "mobx-react";
import store, { IBook} from '../store';


@observer
export class Library extends React.Component<{ delete: (id: string) => Promise<void> }> {
    private isRendered = false;
    render() {
        if (!this.isRendered) this.mount();
        return (
            <div>
                <ul>
                    {store.books.docs.map(
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
        store.books.getAsync();
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
