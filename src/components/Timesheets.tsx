import * as React from 'react';
import { observer } from "mobx-react";
import store from "../store";

import Table from '@material-ui/core/es/Table';
import TableRow from "@material-ui/core/es/TableRow";
import TableCell from "@material-ui/core/es/TableCell";
import TableHead from "@material-ui/core/es/TableHead";
import TableBody from "@material-ui/core/es/TableBody";
import { Fab } from "../MaterialUI/buttons";
import routes from '../config/views';

@observer
export class Timesheets extends React.Component {
    render() {

        const rows = Array.from(store.registrations.docs.values()).map(r => {
            return (
                <TableRow key={r.id}>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{r.project}</TableCell>
                    <TableCell>{r.time}</TableCell>
                </TableRow>
            )
        });
        return (
            <>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
                <Fab onClick={this.addRegistration} icon="add" name="Add new registration"></Fab>
            </>
        );
    }

    addRegistration = () => {
        store.router.goTo(routes["new"]);
    }
}