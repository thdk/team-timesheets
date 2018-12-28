import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../../../stores/RootStore';
import { ListItem, List } from '../../../../MaterialUI/list';
import { IListItemData, AddListItem } from '../../../Controls/AddListItem';

@observer
export class ProjectList extends React.Component {
    render() {
        const items = Array.from(store.config.projects.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { icon, name }} = c;
                    p.push(id === store.config.projectId
                        ? <AddListItem key={id} onCancel={this.unselectItem} onSave={(data) => this.saveListItem(data, id)} data={c.data} onClick={this.selectItem.bind(this, id)}></AddListItem>
                        : <ListItem onClick={this.selectItem.bind(this, id)} icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                }
                return p;
            }, new Array());
        return (
            <List isTwoLine={false}>
                {items}
                <AddListItem labels={{add: "Add project"}} onSave={this.saveListItem.bind(this)} ></AddListItem>
            </List>
        );
    }

    selectItem(id: string) {
        store.config.projectId = id;
    }

    unselectItem() {
        store.config.projectId = undefined;
    }

    saveListItem(data: IListItemData, id?: string) {
        store.config.projectId = undefined;
        if (data.name) {
            store.config.projects.addAsync({ name: data.name, icon: data.icon }, id);
        }
    }
}