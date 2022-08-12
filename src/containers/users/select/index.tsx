import * as React from 'react';

import { ICollectionListProps, CollectionSelect } from '../../../components/collection-select';
import { observer } from 'mobx-react-lite';
import { IWithUsersProps, withUsers } from '../with-users';

type Props = IWithUsersProps
    & Partial<Omit<ICollectionListProps, "items">>
    & Pick<ICollectionListProps, "onChange" | "value">;

export const UserSelect = observer((props: Props) => {
    const { users, ...rest } = props;
    return (
        <CollectionSelect
            id={"users-collection"}
            items={users.map(({ id, name }) => ({ label: name, value: id }))}
            label={"User"}
            {...rest} />
    );
});

export default withUsers(UserSelect);