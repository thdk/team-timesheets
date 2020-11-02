import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../contexts/store-context';
import { Fab } from "@rmwc/fab";

import "./fabs.css";

export const Fabs = observer(() => {
    const store = useStore();

    return <div
        className="fabs"
    >
        {store.view.fabs.map((fab, index) => (
            <Fab
                key={fab.icon.content}
                onClick={fab.action}
                icon={fab.icon.content}
                title={fab.icon.label}
                label={fab.icon.label}
                theme={[
                    index === 0
                        ? 'primaryBg'
                        : 'primaryBg',
                    index === 0
                        ? 'onPrimary'
                        : 'onPrimary'
                ]}
            />
        ))}
    </div>;
});
