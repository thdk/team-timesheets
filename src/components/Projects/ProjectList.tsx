import * as React from 'react';
import { List, ListItem } from '../../MaterialUI/list';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';

@observer
export class ProjectList extends React.Component {
    render() {
        console.log(store.config.projects.docs);
        console.log(Array.from(store.config.projects.docs.values())[0] && Array.from(store.config.projects.docs.values())[0].data);
        const items = Array.from(store.config.projects.docs.values())
            .filter(p => p.data)
            .map(p => {
                console.log(p.data);
            const { id, data: { icon = "star", name = "test" } = {} } = p;
            return (
                <ListItem icon={icon} key={id} lines={[name!]}></ListItem>
            );
        });
        return (
            <List isTwoLine={false}>
                {items}
            </List>
        );
    }
}