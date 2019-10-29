import * as React from 'react';

import CollectionSelect, { ICollectionListProps } from '../../../components/collection-select';
import { observer } from 'mobx-react-lite';
import { IWithUsersProps, withUsers } from '../with-users';

type Props = IWithUsersProps
    & Partial<Omit<ICollectionListProps, "items">>
    & Pick<ICollectionListProps, "onChange" | "value">;

export const UserSelect = observer((props: Props) => {
    const { users, ...rest } = props;
    return (
        <CollectionSelect
            items={props.users}
            label={"User"}
            {...rest}>
        </CollectionSelect>
    );
});

export default withUsers(UserSelect);