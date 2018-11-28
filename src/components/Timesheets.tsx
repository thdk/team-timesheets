import * as React from 'react';
import { observer } from "mobx-react";
import store from "../store";

@observer
export class Timesheets extends React.Component {
    private isRendered = false;
    render() {
        if (!this.isRendered) {
            this.mount();
            this.isRendered = true;
        }

        return(
            <div>qsdfqsdfqsdfq sdfqsdf</div>
        );
    }

    mount() {
        store.registrations.getDocs();
    }
}