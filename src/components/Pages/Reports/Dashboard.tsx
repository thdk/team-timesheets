import * as React from 'react';
import { FlexGroup } from '../../Layout/flex';
import { RegistrationsPerProject } from '../../../routes/reports/RegistrationsPerProject';
import { RegistrationsPerTask } from '../../../routes/reports/RegistrationsPerTask';


export class Dashboard extends React.Component {
    render() {
        return (
            <FlexGroup>
                <RegistrationsPerProject></RegistrationsPerProject>
                <RegistrationsPerTask></RegistrationsPerTask>
            </FlexGroup>
        );
    }
}
