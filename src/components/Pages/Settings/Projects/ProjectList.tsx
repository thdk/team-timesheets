import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../../../stores/RootStore';
import { ListItem, List } from '../../../../mdc/list';
import { IListItemData, AddListItem } from '../../../Controls/AddListItem';
import { canAddProject, canEditProject } from '../../../../rules/rules';
import { Box } from '../../../Layout/box';

@observer
export class ProjectList extends React.Component {
    render() {
        const activeItems = Array.from(store.config.activeProjects)
            .reduce((p, c) => {
                    const { id, icon, name } = c;
                    const project = store.config.project.get();
                    p.push(project && id === project.id && canEditProject(c, store.user.authenticatedUser, store.user.userId)
                        ? <AddListItem key={id} onCancel={this.unselectItem} onSave={(data) => this.saveListItem(data, id)} data={c} onClick={this.selectItem.bind(this, id)}></AddListItem>
                        : <ListItem onClick={this.selectItem.bind(this, id)} icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                return p;
            }, new Array());

        const archivedItems = Array.from(store.config.archivedProjects)
            .reduce((p, c) => {
                    const { id, icon, name } = c;
                    p.push(
                        <ListItem onClick={this.selectItem.bind(this, id)} icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                return p;
            }, new Array());

        const addProject = canAddProject(store.user.authenticatedUser)
            ? <AddListItem labels={{add: "Add project"}} onSave={this.saveListItem.bind(this)} ></AddListItem>
            : undefined;

        return (
            <Box>
                <h3 className="mdc-typography--subtitle1">Active projects</h3>
                <List isTwoLine={false}>
                    {activeItems}
                    {addProject}
                </List>

                <h3 className="mdc-typography--subtitle1">Archived projects</h3>

                <List isTwoLine={false}>
                    {archivedItems}
                </List>
            </Box>
        );
    }

    selectItem(id: string) {
        store.config.setSelectedProject(id);
    }

    unselectItem() {
        store.config.setSelectedProject();
    }

    saveListItem(data: IListItemData, id?: string) {
        if (!store.user.userId) {
            throw new Error("Can't save project without a valid user id");
        }

        store.config.setSelectedProject();
        if (data.name) {
            store.config.addProject({ name: data.name,
                icon: data.icon,
                createdBy: store.user.userId
             }, id);
        }
    }
}