import * as React from 'react';
import { TextField } from './textfield';

export class Form extends React.Component<{children: React.ReactElement<TextField>[]}> {
    render() {
        return (
            <div className="form">
                {React.Children.map(this.props.children, child => {
                    return (
                        <div className="form-item">
                            {child}
                        </div>
                    );
                })}
            </div>
        );
    }
}