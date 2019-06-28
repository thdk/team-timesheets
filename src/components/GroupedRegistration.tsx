import * as React from 'react';
import { ListItem, List, ListDivider } from '../mdc/list';
import { IGroupedRegistrations } from '../stores/TimesheetsStore';
import { observer } from 'mobx-react';
import { IRegistration } from '../../common/dist';
import { RegistrationLines } from './registrations/RegistrationLine/RegistrationLines';


export interface IGroupedRegistrationProps {
    group: IGroupedRegistrations<Date>;
    registrationClick: (id: string) => void;
    headerClick: (e: React.MouseEvent) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
    denseList?: boolean;
    isCollapsed: boolean;
    isCollapsable?: boolean;
}

@observer
export class GroupedRegistration extends React.Component<IGroupedRegistrationProps> {
    private registrationRef: React.RefObject<HTMLDivElement>;
    constructor(props: IGroupedRegistrationProps) {
        super(props);
        this.registrationRef = React.createRef();
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
            headerClick,
            registrationToggleSelect: registrationSelect,
            isCollapsed
        } = this.props;

        const listStyle = { width: '100%' };


        const totalLabel = createTotalLabel(groupKey);

        const total = <ListItem
            onClick={headerClick}
            lines={[totalLabel]}
            icon={isCollapsable ? isCollapsed ? "chevron_right" : "expand_more" : undefined}
            meta={parseFloat(totalTime.toFixed(2)) + " hours"}
            disabled={true}>
        </ListItem>

        const extraStylingForTotalList = {
            ...(isCollapsable ? { cursor: "pointer" } : {}),
            ...({ paddingTop: 0, paddingBottom: 0 })
        };

        const totalList =
            <List isDense={denseList} style={{ ...listStyle, ...extraStylingForTotalList }}>
                {total}
                <ListDivider></ListDivider>
            </List>;

        const topTotal = totalOnTop ? totalList : undefined;
        const bottomTotal = totalOnTop ? undefined : totalList;

        return (
            <div ref={this.registrationRef}>
                {topTotal}
                <div style={{ ...listStyle, display: isCollapsed ? "none" : "block" }}>
                    <RegistrationLines
                        registrations={registrations}
                        registrationClick={registrationClick}
                        registrationToggleSelect={registrationSelect}>
                    </RegistrationLines>
                    <ListDivider></ListDivider>
                </div>
                {bottomTotal}
            </div>
        );
    }

    public scrollIntoView() {
        this.registrationRef.current && this.registrationRef.current.scrollIntoView({ behavior: "smooth" });
    }
}