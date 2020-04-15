import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Fab } from '../../../mdc/buttons/fab';
import { useStore } from '../../../contexts/store-context';

export const Fabs = observer(() => {
    const store = useStore();

    return <>
        {store.view.fabs.map(fab => (
            <Fab key={fab.icon.content} onClick={fab.action} icon={fab.icon.content} name={fab.icon.label}></Fab>
        ))}
    </>;
});
