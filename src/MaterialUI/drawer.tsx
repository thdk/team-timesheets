import * as React from 'react';
import { MDCDrawer } from "@material/drawer/index";
import store from '../store';
import { observer } from 'mobx-react';

@observer
export class Drawer extends React.Component {
    private mdcDrawer?: MDCDrawer;

    render() {
        const displayName = store.user.user ? store.user.user.displayName : "";
        return (<>
            <aside className="mdc-drawer mdc-drawer--dismissible">
                <div className="mdc-drawer__header">
                    <h3 className="mdc-drawer__title">Timesheets</h3>
                    <h6 className="mdc-drawer__subtitle">{displayName}</h6>
                </div>
                <div className="mdc-drawer__content">
                    {this.props.children}
                </div>
            </aside>
        </>
        );
    }

    componentDidMount() {
        this.mdcDrawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    }

    public toggle(open: boolean) {
        if (!this.mdcDrawer) return;

        this.mdcDrawer.open = open;
    }
}