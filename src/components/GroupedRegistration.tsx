import * as React from 'react';
import store from '../stores/RootStore';
import { ListItem, List, ListDivider } from '../mdc/list';
import { IGroupedRegistrations } from '../stores/TimesheetsStore';
import { observer } from 'mobx-react';
import { Checkbox } from '../mdc/checkbox';
import { FlexGroup } from './Layout/flex';
import { IRegistration } from '../../common/dist';


export interface IGroupedRegistrationProps {
    group: IGroupedRegistrations<Date>;
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
    denseList?: boolean;
    isCollapsed?: boolean;
    isCollapsable?: boolean;
}

interface IGroupedRegistrationState {
    isCollapsed: boolean;
}

@observer
export class GroupedRegistration extends React.Component<IGroupedRegistrationProps, IGroupedRegistrationState> {
    private registrationRef: React.RefObject<HTMLDivElement>;
    constructor(props: IGroupedRegistrationProps) {
        super(props);
        this.registrationRef = React.createRef();

        this.state = { isCollapsed: !!props.isCollapsed };
    }

    render() {
        const { isCollapsable = false, denseList, group: { registrations, groupKey, totalTime }, createTotalLabel, totalOnTop, registrationClick, registrationToggleSelect: registrationSelect } = this.props;
        const { isCollapsed } = this.state;

        const listStyle = { width: '100%' };
        const rows = registrations.map(r => {
            if (!r.data) throw new Error("Found registration without Data");

            const { id, data: { description = "...", project, time, task, client } } = r;

            const projectData = project ? store.config.projects.docs.get(project) : null;
            const { data: { name: projectName = "" } = {} } = projectData || {};

            const taskData = task ? store.config.tasks.docs.get(task) : null;
            const { data: { icon = undefined } = {} } = taskData || {};

            const clientData = client ? store.config.clientsCollection.docs.get(client) : null;
            const { data: { name: clientName = undefined } = {} } = clientData || {};

            const line1 = projectName;
            const line2 = `${clientName ? clientName + " - " : ""}${description}`;

            const checkbox = registrationSelect
                ? <div className="clickable"><Checkbox checked={store.view.selection.has(id)} onClick={registrationSelect.bind(this, id, r.data!)}></Checkbox></div>
                : undefined;

            const meta =
                <FlexGroup center={true} style={{ justifyContent: "space-between", width: checkbox ? "8em" : "auto" }}>
                    <div>{`${time ? parseFloat(time.toFixed(2)) : 0}`}</div>
                    {checkbox}
                </FlexGroup>;

            return (
                <ListItem
                    icon={icon}
                    key={id}
                    lines={[line1, line2]}
                    meta={meta}
                    onClick={registrationClick.bind(this, id)}>
                </ListItem>
            );
        });
        const totalLabel = createTotalLabel(groupKey);

        const total = <ListItem
            onClick={isCollapsable ? this.setState.bind(this, { isCollapsed: !isCollapsed }) : undefined}
            lines={[totalLabel]}
            icon={isCollapsable ? isCollapsed ? "chevron_right" : "expand_more" : undefined}
            meta={parseFloat(totalTime.toFixed(2)) + " hours"}
            disabled={true}>
        </ListItem>

        const extraStylingForTotalList = {
            ...(isCollapsable ? { cursor: "pointer" } : {}),
            ...({ paddingTop: 0, paddingBottom: 0 })
        };

        const totalList = <List isDense={denseList} style={{ ...listStyle, ...extraStylingForTotalList }}>{total}<ListDivider></ListDivider></List>;
        const topTotal = totalOnTop ? totalList : undefined;
        const bottomTotal = totalOnTop ? undefined : totalList;

        return (
            <div ref={this.registrationRef}>
                {topTotal}
                <List isDense={denseList} isTwoLine={true} style={{ ...listStyle, display: isCollapsed ? "none" : "block" }}>
                    {rows}
                    <ListDivider></ListDivider>
                </List>
                {bottomTotal}
            </div>
        );
    }

    public scrollIntoView() {
        this.registrationRef.current && this.registrationRef.current.scrollIntoView({ behavior: "smooth" });
    }

    componentDidUpdate(_prevProps: IGroupedRegistrationProps, prevState: IGroupedRegistrationState) {
        if (prevState.isCollapsed !== this.props.isCollapsed) {
            this.setState({ isCollapsed: !!this.props.isCollapsed });
        }
    }
}