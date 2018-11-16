import React from 'react';
import {observer} from "mobx-react";
import { IAppStore, IBook } from "../app";


@observer
export class Library extends React.Component<IAppStore> {
    render() {
        return (
            <div>
              <ul>
              { this.props.books.docs.map(
                book => <BookView author={book.author} title={book.title} key={book.id} id={book.id} />
              ) }
              </ul>
            </div>);
    }
};

@observer class BookView extends React.Component<IBook> {
    render() {
        const {author, title} = this.props;
        return (
            <li>{author} - {title}</li>
        );
    }
}