import { Select } from '@rmwc/select';
import React from 'react';
import { useTheme } from '../../../components/theme-provider';
import { useUserStore } from '../../../contexts/user-context';

export const ThemePreferences = () => {

    const {
        setTheme,
    } = useTheme();

    const user = useUserStore();

    return (
        <>
            <h3 className="mdc-typography--subtitle1">
                Theme preferences
            </h3>
            <Select
                outlined
                value={user.divisionUser?.theme || "auto"}
                onChange={(e) => {
                    setTheme(e.currentTarget.value);
                    user.updateDivisionUser({
                        theme: e.currentTarget.value,
                    });
                }}
            >
                <option
                    value={"auto"}
                >
                    Auto
                </option>
                <option
                    value={"light"}
                >
                    Light
                </option>
                <option
                    value={"dark"}
                >
                    Dark
                </option>
            </Select>
        </>
    )
}