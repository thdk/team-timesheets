
import React from 'react';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';
import FavoriteGroupList from '../../containers/favorite-groups/list';

const Favorites = () => {
   return <FavoriteGroupList></FavoriteGroupList>;
}

export default withAuthentication(
    Favorites,
    <RedirectToLogin />,
);
