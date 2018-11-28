import { observer } from "mobx-react";
import store from "../store";
import * as React from 'react';


@observer
export class BookInput extends React.Component<{}, { title: string, author: string }> {
    constructor(props: {}) {
        super(props);
        this.state = { title: '', author: '' };
    }

    render() {
        return (<div>
            <label>Title</label>
            <input value={this.state.title} type="text" onChange={this.changeTitle}></input>

            <label>Author</label>
            <input value={this.state.author} type="text" onChange={this.changeAuthor}></input>
            <button onClick={this.click} color="primary">
                Add book
             </button>
        </div>
        );
    }

    changeAuthor = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ author: e.target.value })
    }

    changeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ title: e.target.value })
    }

    click = () => {
        const { author, title } = this.state;
        store.books.addAsync({ title, author });
        this.setState({ author: "", title: "" });
        console.log("new version");
    }
}