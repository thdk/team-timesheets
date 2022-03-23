import React from 'react';
import { useUserData } from '../../users/hooks/use-user-data';
export const UserName = ({ id }: { id?: string }) => {
    const data = useUserData(id);
    if (!id) {
        return null;
    }

    return (
        <>
            {data?.name}
        </>
    );
};