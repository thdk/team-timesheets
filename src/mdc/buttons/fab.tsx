import * as React from 'react';

export class Fab extends React.Component<{ icon: string, name: string, onClick: (e: React.MouseEvent) => void }> {
    render() {
        return (
            <button onClick={this.props.onClick} className="mdc-fab app-fab--absolute" aria-label={this.props.name}>
                <span className="mdc-fab__icon material-icons">{this.props.icon}</span>
            </button>
        );
    }
}
