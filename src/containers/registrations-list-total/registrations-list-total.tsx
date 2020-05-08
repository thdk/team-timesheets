import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/store-context";
import { ListItem, ListItemText, ListItemMeta, List, ListDivider } from "@rmwc/list";

export const TotalList = observer(() => {
    const store = useStore();

    const totalTime = store.timesheets.registrationsTotalTime;

    const Total = () => (
        <ListItem key={`total-month`} disabled={true}>
            <ListItemText>
                {`Total in ${store.view.moment.format('MMMM')}`}
            </ListItemText>
            <ListItemMeta>
                {parseFloat(totalTime.toFixed(2)) + " hours"}
            </ListItemMeta>
        </ListItem>
    );

    return (
        <List style={{ width: "100%" }}>
            <ListDivider />
            <Total />
            <ListDivider />
        </List>
    )
});
