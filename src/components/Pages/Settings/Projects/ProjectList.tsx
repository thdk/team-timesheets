import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../../../stores/RootStore';
import { ListItem, List } from '../../../../mdc/list';
import { IListItemData, AddListItem } from '../../../Controls/AddListItem';
import { canAddProject, canEditProject } from '../../../../rules/rules';

@observer
export class ProjectList extends React.Component {
    render() {
        const items = Array.from(store.config.projects.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { icon, name }} = c;
                    p.push(id === store.config.projectId && canEditProject(c.data, store.user.authenticatedUser, store.user.userId)
                        ? <AddListItem key={id} onCancel={this.unselectItem} onSave={(data) => this.saveListItem(data, id)} data={c.data} onClick={this.selectItem.bind(this, id)}></AddListItem>
                        : <ListItem onClick={this.selectItem.bind(this, id)} icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                }
                return p;
            }, new Array());

        const addProject = canAddProject(store.user.authenticatedUser)
            ? <AddListItem labels={{add: "Add project"}} onSave={this.saveListItem.bind(this)} ></AddListItem>
            : undefined;

        return (
            <List isTwoLine={false}>
                {items}
                {addProject}
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
        if (!store.user.userId) {
            throw new Error("Can't save project without a valid user id");
        }

        store.config.projectId = undefined;
        if (data.name) {
            store.config.projects.addAsync({ name: data.name, icon: data.icon, createdBy: store.user.userId }, id);
        }
    }
}