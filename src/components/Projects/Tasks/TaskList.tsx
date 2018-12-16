import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../../stores/RootStore';
import { ListItem, List } from '../../../MaterialUI/list';

@observer
export class TaskList extends React.Component {
    render() {
        const items = Array.from(store.config.tasks.docs.values()).map(t => {
            const { id, data: { icon, name } } = t;
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