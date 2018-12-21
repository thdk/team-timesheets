import * as React from 'react';
import { List, ListItem } from '../../MaterialUI/list';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';

@observer
export class ProjectList extends React.Component {
    render() {
        const items = Array.from(store.config.projects.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { icon, name }} = c;
                    p.push(
                        <ListItem icon={icon} key={id} lines={[name]}></ListItem>
                    );
                }
                return p;
            }, new Array());
        return (
            <List isTwoLine={false}>
                {items}
            </List>
        );
    }
}