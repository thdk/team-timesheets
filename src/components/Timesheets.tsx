import * as React from 'react';
import { observer } from "mobx-react";
import { Fab } from "../MaterialUI/buttons";
import routes from '../routes/index';
import { goToRegistration } from '../internal';
import store from '../stores/RootStore';
import { FlexGroup } from './Layout/flex';
import { GroupedRegistrations } from './GroupedRegistrations';

@observer
export class Timesheets extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    render() {
        return (
            <>
                <FlexGroup direction="vertical">
                    <div style={{ paddingLeft: "1em" }}>
                        <h3 className="mdc-typography--subtitle1">
                            {`Timesheet ${store.view.moment.format('LL')}`}
                        </h3>
                    </div>
                    <GroupedRegistrations registrationClick={this.registrationClick.bind(this)}/>
                </FlexGroup>
                <Fab onClick={this.addRegistration} icon="add" name="Add new registration"></Fab>
            </>
        );
    }

    addRegistration = () => {
        store.router.goTo(routes.newRegistration, {}, store);
    }
}