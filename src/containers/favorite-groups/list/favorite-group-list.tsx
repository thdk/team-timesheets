import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { SettingsList } from '../../../components/settings-list';
import { goToFavorite } from '../../../internal';
import { Box } from '../../../components/layout/box';
import withFavoriteGroups from '../with-favorite-groups';
import { IFavoriteRegistrationGroup } from '../../../../common/dist';
import { useStore } from '../../../contexts/store-context';
import { useFavoriteGroupStore } from '../../../contexts/favorite-context';

type FavoriteGroupListProps = React.HTMLProps<HTMLDivElement> &
{
    groups: (IFavoriteRegistrationGroup & { id: string })[];
}

const FavoriteGroupList = observer((props: FavoriteGroupListProps) => {
    const store = useStore();
    const favoriteGroupStore = useFavoriteGroupStore();

    const { groups, ...restProps } = props;

    const handleItemClicked = (id: string | undefined) => {
        if (!id) return;

        if (store.view.selection.size) {
            store.view.toggleSelection(id);
        } else {
            goToFavorite(store.router, id);
        }
    };

    const onSelectItem = (id: string) => {
        if (favoriteGroupStore.activeDocument) {
            favoriteGroupStore.setActiveDocumentId(undefined);
        }

        store.view.toggleSelection(id);
    };

    const FavoriteGroups = () => groups.length
        ? <>
            <Box>
                <p>Add these favorites easily into your timesheet by pressing the little + icon either on your day or month view.</p>
            </Box>
            <hr className="mdc-list-divider" />
            <SettingsList {...restProps}
                items={favoriteGroupStore.groups}
                onToggleSelection={onSelectItem}
                onItemClick={handleItemClicked}
                selection={store.view.selection}
                activeItemId={favoriteGroupStore.activeDocumentId}
            ></SettingsList>
            <hr className="mdc-list-divider" />
        </>
        : <Box>
            <p>
                You don't have any favorites yet. Start adding registrations as favorite from your timesheet.
        </p>
            <p>
                Select registrations with the checkbox and click the favorite icon in the top action bar.
        </p>
        </Box>;

    return <>
        <FavoriteGroups />
    </>;
});

export default withFavoriteGroups(FavoriteGroupList)
