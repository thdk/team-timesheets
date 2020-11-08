import React, { useCallback } from "react";

import { DivisionDetail } from "./division-detail";
import { useDivisionStore } from "../../../contexts/division-context";
import { observer } from "mobx-react-lite";

export const DivisionDetailContainer = observer(() => {
    const divisionStore = useDivisionStore();
    const activeDocument = divisionStore.activeDocument;

    const handleIconChanged = useCallback((icon: string) => {
        if (activeDocument) {
            activeDocument.icon = icon;
        }
    }, [activeDocument]);

    const handleNameChanged = useCallback((name: string) => {
        if (activeDocument) {
            activeDocument.name = name;
        }
    }, [activeDocument]);

    return activeDocument
        ? <DivisionDetail
            onIconChanged={handleIconChanged}
            onNameChanged={handleNameChanged}
            {...activeDocument}
        />
        : null;
});
