import * as React from 'react';
import { List, ListItem } from '../../MaterialUI/list';
import { observer } from 'mobx-react';
import store from '../../store';

@observer
export class ProjectList extends React.Component {
    render() {
        const items = Array.from(store.config.projects.docs.values()).map(p => {
            return (
                <ListItem icon={p.icon} key={p.id}>
                    <span className="mdc-list-item__text">{p.name}</span>
                </ListItem>
            );
        });
        return (
            <List>
                <>{items}</>
            </List>
        );
    }
}