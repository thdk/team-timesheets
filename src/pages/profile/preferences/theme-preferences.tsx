import { Checkbox } from '@rmwc/checkbox';
import { Theme } from '@rmwc/theme';
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
            <Theme
                use={["surface"]}
            >
                <Checkbox
                    checked={darkMode}
                    label={"Darkmode"}
                    onChange={(e: React.ChangeEvent) => setDarkMode((e.currentTarget as HTMLInputElement).checked)}
                />
            </Theme>
        </>
    )
}