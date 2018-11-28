import { observer } from 'mobx-react';
import * as React from 'react';
import store, { IBook } from '../store';

@observer
export class Library extends React.Component {
    private isRendered = false;
    render() {
        if (!this.isRendered) {
            this.mount();
            this.isRendered = true;
        }

        return (
            <div>
                <ul>
                    {Array.from(store.books.docs.values()).map(
                        book => <BookView key={book.id} {...book} />
                    )}
                </ul>
            </div>);
    }

    mount() {
        store.books.getDocs();

        window.setTimeout(() => store.books.query = ref => ref.where("author", "==", "thdk"), 5000);
    }
};

@observer
class BookView extends React.Component<IBook> {

    render() {
        const { author, title } = this.props;
        return (
            <li onClick={this.click}>{author} - {title}</li>
        );
    }

    click = () => {
        store.books.deleteAsync(this.props.id);
        return null;
    }
}
