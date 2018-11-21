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
                    {Array.from(store.books.docs.values()).map(
                        book => <BookView key={book.id} onclick={() => store.books.deleteAsync(book.id)} {...book}  />
                    )}
                </ul>
            </div>);
    }

    remove(id: string) {
        this.props.delete(id);
    }

    mount() {
        this.isRendered = true;
        store.books.getDocs();

       // window.setTimeout(() => store.books.query= ref => ref.where("author", "==", "thdk"), 5000);
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
