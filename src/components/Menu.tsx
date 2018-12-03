import * as React from 'react';
import {DatetimePicker} from 'rc-datetime-picker';
import store from '../store';
import moment from 'moment-es6';
import { observer } from 'mobx-react';
import { goTo as goToOverview } from "../internal";

@observer
export class Menu extends React.Component {

    dateChanged = (moment: moment.Moment) => {
        goToOverview({year: moment.year(), day: moment.date(), month: moment.month() + 1});
    }

    render() {
        console.log("menu render");
        return (
            <>
                <DatetimePicker moment={moment(store.view.moment)} showTimePicker={false} onChange={this.dateChanged}></DatetimePicker>
                <div className="mdc-list">
                    <a className="mdc-list-item mdc-list-item--activated" href="#" aria-selected="true">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">inbox</i>
                        <span className="mdc-list-item__text">Overview</span>
                    </a>
                    <a className="mdc-list-item" href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">send</i>
                        <span className="mdc-list-item__text">Export</span>
                    </a>
                    <a className="mdc-list-item" href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">drafts</i>
                        <span className="mdc-list-item__text">Messages</span>
                    </a>
                    <hr className="mdc-list-divider" />
                    <h6 className="mdc-list-group__subheader">Planning</h6>
                    <a className="mdc-list-item" href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bookmark</i>
                        <span className="mdc-list-item__text">Projects</span>
                    </a>
                    <a className="mdc-list-item" href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bookmark</i>
                        <span className="mdc-list-item__text">Users</span>
                    </a>
                    <a className="mdc-list-item" href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bookmark</i>
                        <span className="mdc-list-item__text">Teams</span>
                    </a>
                </div>
            </>
        );
    }
}