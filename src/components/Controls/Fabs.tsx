import * as React from 'react';
import { observer } from 'mobx-react-lite';
import store from '../../stores/RootStore';
import { Fab } from '../../mdc/buttons/fab';

export const Fabs = observer(() => {
    return <>
        {store.view.fabs.map(fab => (
            <Fab key={fab.icon.content} onClick={fab.action} icon={fab.icon.content} name={fab.icon.label}></Fab>
        ))}
    </>;
});
