import { BookInput } from "./BookInput";
import { Library } from "./Library";
import * as React from 'react';
import { Timesheets } from "./Timesheets";

export class App extends React.Component {
    render() {
        return (
            <div>
                <Library ></Library>
                <BookInput></BookInput>
                <Timesheets></Timesheets>
            </div>
        )
    }
}
