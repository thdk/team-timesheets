import * as React from 'react';
import { observer } from 'mobx-react';
import { Chip, ChipSet } from '@material/react-chips';

import { Box } from '../../../components/layout/box';
import ClientSelect from '../../../containers/clients/select';
import { UserTasks } from '../../../containers/users/user-tasks';
import { FormField } from '../../../components/layout/form';

import {
    IWithAuthenticatedUserProps,
    withAuthenticatedUser
} from '../../../containers/users/with-authenticated-user';
import { StoreContext } from '../../../contexts/store-context';

type Props = IWithAuthenticatedUserProps;

@observer
class Preferences extends React.Component<Props> {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    render() {
        const { authenticatedUser: user } = this.props;

        if (this.context.config.tasks.length === 0) return null;

        const { tasks: userTasks = new Map<string, true>(), defaultTask = undefined, defaultClient = undefined } = this.context.user.authenticatedUser || {};
        const tasks =this.context.config.tasks
            .reduce((p, c) => {
                    const { id: taskId, name: taskName, icon: taskIcon = undefined } = c;
                    const leadingIcon = taskIcon ? <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{taskIcon}</i> : undefined;
                    p.push(
                        <Chip leadingIcon={leadingIcon} handleSelect={this.handleTaskSelect} id={taskId} label={taskName!} key={taskId}></Chip>
                    );
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

        this.context.user.updateAuthenticatedUser({
            tasks,
        });
    }

    defaultTaskChanged = (defaultTask: string) => {
        this.context.user.updateAuthenticatedUser({
            defaultTask
        });
    }

    defaultClientChanged = (defaultClient: string) => {
        this.context.user.updateAuthenticatedUser({
            defaultClient
        });
    }
}

export default withAuthenticatedUser(Preferences);
