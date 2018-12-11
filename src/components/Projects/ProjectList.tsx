import * as React from 'react';
import { List, ListItem } from '../../MaterialUI/list';
import { observer } from 'mobx-react';
import store from '../../store';

@observer
export class ProjectList extends React.Component {
    render() {
        const items = Array.from(store.config.projects.docs.values()).map(p => {
            const { id, data: { icon, name } } = p;
            return (
                <ListItem icon={icon} key={id}>
                    <span className="mdc-list-item__text">{name}</span>
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