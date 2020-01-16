import * as React from 'react';
import { observer } from 'mobx-react';
import { Chip, ChipSet } from '@material/react-chips';

import store from '../../../stores/root-store';
import { Box } from '../../../components/layout/box';
import ClientSelect from '../../../containers/clients/select';
import { UserTasks } from '../../../containers/users/user-tasks';
import { FormField } from '../../../components/layout/form';

import {
    IWithAuthenticatedUserProps,
    withAuthenticatedUser
} from '../../../containers/users/with-authenticated-user';

type Props = IWithAuthenticatedUserProps;

@observer
class Preferences extends React.Component<Props> {
    render() {
        const { authenticatedUser: user } = this.props;

        if (store.config.tasks.docs.length === 0) return null;

        const { tasks: userTasks = new Map<string, true>(), defaultTask = undefined, defaultClient = undefined } = store.user.authenticatedUser || {};
        const tasks = Array.from(store.config.tasks.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id: taskId, data: { name: taskName, icon: taskIcon = undefined } } = c;
                    const leadingIcon = taskIcon ? <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{taskIcon}</i> : undefined;
                    p.push(
                        <Chip leadingIcon={leadingIcon} handleSelect={this.handleTaskSelect} id={taskId} label={taskName!} key={taskId}></Chip>
                    );
                }
                return p;
            }, new Array());

        // TODO: create computed value on user store containing the data of the user tasks
        const userTasksChips = user.tasks.size > 1
            ? <UserTasks value={defaultTask} onChange={this.defaultTaskChanged}></UserTasks>
            : undefined;

        return (
            <>
                <Box>
                    <h3 className="mdc-typography--subtitle1">Pick your tasks</h3>
                    <p>Only selected tasks will be available for you when adding a new regisration.</p>
                    <ChipSet selectedChipIds={Array.from(userTasks.keys())} filter={true}>{tasks}</ChipSet>

                    {userTasksChips}

                    <h3 className="mdc-typography--subtitle1">Pick default client</h3>
                    <FormField first={false}>
                        <ClientSelect onChange={this.defaultClientChanged} label="Default client" value={defaultClient}></ClientSelect>
                    </FormField>
                </Box>
            </>
        );
    }

    handleTaskSelect = (id: string, selected: boolean) => {
        const { authenticatedUser: { tasks } } = this.props;

        if (selected === !!tasks.get(id)) return;

        if (selected) tasks.set(id, true);
        else tasks.delete(id);

        store.user.updateAuthenticatedUser({
            tasks,
        });
    }

    defaultTaskChanged = (defaultTask: string) => {
        store.user.updateAuthenticatedUser({
            defaultTask
        });
    }

    defaultClientChanged = (defaultClient: string) => {
        store.user.updateAuthenticatedUser({
            defaultClient
        });
    }
}

export default withAuthenticatedUser(Preferences);
