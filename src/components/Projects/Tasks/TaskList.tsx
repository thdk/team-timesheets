import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../../stores/RootStore';
import { ListItem, List } from '../../../MaterialUI/list';
import { ReactNode } from 'react';

@observer
export class TaskList extends React.Component {
    render() {
        const items = Array.from(store.config.tasks.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { icon, name } } = c;
                    p.push(
                        <ListItem icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                }
                return p;
            }, new Array<ReactNode>());

        return (
            <List isTwoLine={false}>
                {items}
            </List>
        );
    }
}