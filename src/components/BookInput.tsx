import { observer } from "mobx-react";
import { OptionalId } from "../Firestorable/types";
import { IBook } from "../store";
import * as React from 'react';

@observer
export class BookInput extends React.Component<{ add: (book: OptionalId<IBook>) => void }, { title: string, author: string }> {
    constructor(props: { add: (book: Overwrite<IBook, { id?: string }>) => void }) {
        super(props);
        this.state = { title: '', author: '' };
    }

    render() {
        return (<div>
            <label>Title</label>
            <input value={this.state.title} type="text" onChange={(e) => this.changeTitle(e)}></input>

            <label>Author</label>
            <input value={this.state.author} type="text" onChange={(e) => this.changeAuthor(e)}></input>
            <button onClick={() => this.click()}>Add book</button>
        </div>
        );
    }

    changeAuthor(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ author: e.target.value })
    }

    changeTitle(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ title: e.target.value })
    }

    click() {
        const { author, title } = this.state;
        this.props.add({ title, author });
        this.setState({ author: "", title: "" });
    }
}