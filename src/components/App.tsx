import { IAppStore, IBook } from "../app";
import React from "react";
import { Library } from "./Library";
import { OptionalId } from "../Firestorable/types";
import { BookInput } from "./BookInput";

export class App extends React.Component<IAppStore> {
    render() {

        const { books } = this.props;
        const actions = {
            delete: (id: string) => books.deleteAsync(id),
            add: (book: OptionalId<IBook>) => books.addAsync(book)
        };

        return (
            <div>
                <Library books={books} delete={actions.delete}></Library>
                <BookInput add={actions.add}></BookInput>
            </div>
        )
    }
}
