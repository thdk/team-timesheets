import * as React from 'react';
import { observer } from 'mobx-react';
import { ReactNode } from 'react';
import { IReactProps } from '../../../../types';
import store from '../../../../stores/RootStore';
import { AddListItem, IListItemData } from '../../../Controls/AddListItem';
import { ListItem, List } from '../../../../MaterialUI/list';

export interface ITaskListState {
    newTask?: { name?: string, icon?: string }
}

@observer
export class TaskList extends React.Component<IReactProps, ITaskListState> {
    constructor(props: IReactProps) {
        super(props);
        this.state = {};
    }

    render() {
        const items = Array.from(store.config.tasks.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { icon = "", name } } = c;
                    p.push(id === store.config.taskId
                        ? <AddListItem key={id} onCancel={this.unselectItem} onSave={(data) => this.saveListItem(data, id)} data={c.data} onClick={this.selectItem.bind(this, id)}></AddListItem>
                        : <ListItem onClick={this.selectItem.bind(this, id)} icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                }
                return p;
            }, new Array<ReactNode>());



        return (
            <>
                <List isTwoLine={false}>
                    {items}
                    <AddListItem labels={{add: "Add task"}} onSave={this.saveListItem.bind(this)} ></AddListItem>
                </List>
            </>
        );
    }

    selectItem(id: string) {
        store.config.taskId = id;
    }

    unselectItem() {
        store.config.taskId = undefined;
    }

    saveListItem(data: IListItemData, id?: string) {
        store.config.taskId = undefined;
        if (data.name) {
            store.config.tasks.addAsync({ name: data.name, icon: data.icon }, id);
        }
    }
}