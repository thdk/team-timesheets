import {observer} from 'mobx-react';
import * as React from 'react';
import store, { IBook } from '../store';

@observer
export class Library extends React.Component<{ delete: (id: string) => Promise<void> }> {
    private isRendered = false;
    render() {
        if (!this.isRendered) this.mount();
        return (
            <div>
                <ul>
                    {store.books.docs.map(
                        book => <BookView onclick={() => store.books.deleteAsync(book.id)} author={book.author} title={book.title} key={book.id} id={book.id} />
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

        window.setTimeout(() => store.books.query= ref => ref.where("author", "==", "thdk"), 5000);
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
