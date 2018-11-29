import * as React from 'react';
import { MDCDrawer } from "@material/drawer";
import { observer } from '../../node_modules/mobx-react';
import { observe } from '../../node_modules/mobx';
import store from '../store';

@observer
export class Drawer extends React.Component {
    render() {
        return (<>
            <aside className="mdc-drawer mdc-drawer--dismissible">
                <div className="mdc-drawer__header">
                    <h3 className="mdc-drawer__title">Timesheets</h3>
                    <h6 className="mdc-drawer__subtitle">Thomas Dekiere</h6>
                </div>
                <div className="mdc-drawer__content">
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
                </div>
            </aside>
        </>
        );
    }

    componentDidMount() {

        const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

        if (store.view) {
            observe(store.view, change => {
                console.log(change);
                drawer.open = change.object[change.name];
            });
        }
    }

    componentWillUnmount() {

    }
}