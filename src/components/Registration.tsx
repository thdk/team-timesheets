import React from "react";
import { observer } from "mobx-react";
import store from "../store";

@observer
export class Registration extends React.Component {
    private isRendered = false;

    render() {
        if (!this.isRendered) {
            this.mount();
            this.isRendered = true;
        }
        return (
            <>
            </>
        );
    }

    mount() {
        store.registrations.getDocs();
    }
}