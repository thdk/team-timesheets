import * as React from 'react';
import { ListItem, List, ListDivider } from '../mdc/list';
import { IGroupedRegistrations } from '../stores/TimesheetsStore';
import { observer } from 'mobx-react';
import { IRegistration } from '../../common/dist';
import { GroupedRegistrationItems } from './Pages/Timesheets/GroupedRegistrationItems';


export interface IGroupedRegistrationProps {
    group: IGroupedRegistrations<Date>;
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
    denseList?: boolean;
    isCollapsed: boolean;
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
        const { isCollapsable = false,
            denseList,
            group: {
                registrations,
                groupKey,
                totalTime
            },
            createTotalLabel,
            totalOnTop,
            registrationClick,
            registrationToggleSelect: registrationSelect
        } = this.props;

        const { isCollapsed } = this.state;

        const listStyle = { width: '100%' };


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
                    <GroupedRegistrationItems
                        registrations={registrations}
                        registrationClick={registrationClick}
                        registrationToggleSelect={registrationSelect}>
                    </GroupedRegistrationItems>
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