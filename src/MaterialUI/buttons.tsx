import * as React from 'react';

export class Fab extends React.Component<{icon: string, name: string}> {
    render() {
        return (
            <button className="mdc-fab" aria-label={this.props.name}>
                <span className="mdc-fab__icon material-icons">{this.props.icon}</span>
            </button>
        );
    }
}