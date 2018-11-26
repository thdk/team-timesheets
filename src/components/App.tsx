import { Library } from "./Library";
import { BookInput } from "./BookInput";
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
