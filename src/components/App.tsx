import { Library } from "./Library";
import { OptionalId } from "../Firestorable/types";
import { BookInput } from "./BookInput";
import store, { IBook } from "../store";
import * as React from 'react';

export class App extends React.Component {
    render() {
        const {books} = store;
        const actions = {
            delete: (id: string) => books.deleteAsync(id),
            add: (book: OptionalId<IBook>) => books.addAsync(book)
        };

        return (
            <div>
                <Library delete={actions.delete}></Library>
                <BookInput add={actions.add}></BookInput>
            </div>
        )
    }
}
