import * as React from 'react';
import { observer } from "mobx-react";
import store from "../store";

import Table from '@material-ui/core/es/Table';
import TableRow from "@material-ui/core/es/TableRow";
import TableCell from "@material-ui/core/es/TableCell";
import TableHead from "@material-ui/core/es/TableHead";
import TableBody from "@material-ui/core/es/TableBody";
import { Fab } from "../MaterialUI/buttons";
import routes from '../routes/index';
import { goToRegistration } from '../internal';

@observer
export class Timesheets extends React.Component {

    registrationClick = (id: string) => {
        // since beforeEnter doesn't receive the proper params (bug in mobx router)
        // https://github.com/kitze/mobx-router/issues/43
        // we need to query the registration here
        store.registrationsStore.registration = store.registrations.docs.get(id);
        goToRegistration(id);
    }

    render() {

        const rows = Array.from(store.registrations.docs.values()).map(r => {
            const {id, data: {description, project, time, date}} = r;
            return (
                <TableRow key={id} onClick={this.registrationClick.bind(this, id)}>
                    <TableCell>{description}</TableCell>
                    <TableCell>{project}</TableCell>
                    <TableCell>{time}</TableCell>
                    <TableCell>{date && date.toDate().toLocaleDateString()}</TableCell>
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
                            <TableCell>Date</TableCell>
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
        store.router.goTo(routes.newRegistration, {}, store);
    }
}