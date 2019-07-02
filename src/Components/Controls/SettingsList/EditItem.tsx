import * as React from 'react';
import { INameWithIcon } from '../../../../common';

export const SettingsListItemEdit = (props: React.HTMLProps<HTMLDivElement> & { itemData: INameWithIcon }) => {
    const { name, icon, ...restProps } = props.itemData;
    const iconJSX = icon ? <i className="icon material-icons">{icon}</i> : undefined;
    return <div {...restProps}>
        <div className="item-icon">
            {iconJSX}
        </div>
        <div className="item-name">
            {name}
        </div>
    </div>;
};