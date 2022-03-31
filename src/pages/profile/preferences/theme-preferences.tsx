import { Checkbox } from '@rmwc/checkbox';
import React from 'react';
import { useTheme } from '../../../components/theme-provider';

export function ThemePreferences() {

    const {
        darkMode,
        setDarkMode,
    } = useTheme();

    return (
        <>
            <h3 className="mdc-typography--subtitle1">
                Theme preferences
            </h3>
            <Checkbox
                checked={darkMode}
                label={"Dark mode"}
                onChange={(e: React.ChangeEvent) => setDarkMode((e.currentTarget as HTMLInputElement).checked)}
            />
        </>
    )
}