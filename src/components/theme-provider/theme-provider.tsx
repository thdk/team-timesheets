import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { ThemeProvider as RMWCThemeProvider } from "@rmwc/theme";
import classNames from "classnames";
import { useUserStore } from "../../contexts/user-context";
import { observer } from "mobx-react-lite";
import { IUser } from "../../../common";
import Cookies from "js-cookie";

export const ThemeContext = React.createContext({} as {
    setTheme: (name: string) => void;
    theme: string;
});

const autoTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? "dark"
    : "light";

const getThemeFromUser = (user?: IUser) => {
    if (!user && Cookies.get("theme")) {
        return Cookies.get("theme") as string;
    }

    return (!user?.theme || user.theme === "auto")
        ? autoTheme
        : user.theme
}

export const ThemeProvider = observer(({ children }: PropsWithChildren<unknown>) => {

    const user = useUserStore();

    const [theme, setTheme] = useState(getThemeFromUser(user.divisionUser));

    const isDarkTheme = theme === "dark" || (theme === "auto" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(
        () => {
            const newTheme = getThemeFromUser(user.divisionUser);
            setTheme(newTheme);
            Cookies.set("theme", newTheme);            
        },
        [
            user.divisionUser,
        ]
    );

    const themeOptions = isDarkTheme
        ? {
            primary: '#1f2428',
            secondary: '#cc7752',
            error: '#b00020',
            background: '#0e0e0e',
            surface: '#1f2428',
            onPrimary: '#bebeb8',
            onSecondary: 'rgba(0,0,0,0.87)',
            onSurface: '#bebeb8',
            onError: '#fff',
            textPrimaryOnBackground: '#bebeb8',
            textSecondaryOnBackground: '#8ca6ca',
            textHintOnBackground: '#393939',
            textDisabledOnBackground: 'rgba(255, 255, 255, 0.5)',
            textIconOnBackground: 'red',
            textPrimaryOnLight: 'rgba(0, 0, 0, 0.87)',
            textSecondaryOnLight: 'rgba(0, 0, 0, 0.54)',
            textHintOnLight: 'rgba(0, 0, 0, 0.38)',
            textDisabledOnLight: 'rgba(0, 0, 0, 0.38)',
            textIconOnLight: 'rgba(0, 0, 0, 0.38)',
            textPrimaryOnDark: 'white',
            textSecondaryOnDark: 'rgba(255, 255, 255, 0.7)',
            textHintOnDark: 'rgba(255, 255, 255, 0.5)',
            textDisabledOnDark: 'rgba(255, 255, 255, 0.5)',
            textIconOnDark: 'rgba(255, 255, 255, 0.5)'
        }
        : {
            primary: '#009fdc',
            secondary: '#ff9900',
            error: '#b00020',
            background: '#fff',
            surface: '#f1f1f1',
            onPrimary: 'rgba(255, 255, 255, 1)',
            onSecondary: '#ffffff',
            onSurface: 'rgba(0, 0, 0, 0.70)',
            onError: '#fff',
            textPrimaryOnBackground: 'rgba(0, 0, 0, 0.60)',
            textSecondaryOnBackground: '#ff9900',
            textHintOnBackground: 'rgba(0, 0, 0, 0.24)',
            textDisabledOnBackground: 'rgba(0, 0, 0, 0.38)',
            textIconOnBackground: 'rgba(0, 0, 0, 0.38)',
            textPrimaryOnLight: 'rgba(0, 0, 0, 0.54)',
            textSecondaryOnLight: 'rgba(0, 0, 0, 0.54)',
            textHintOnLight: 'rgba(0, 0, 0, 0.38)',
            textDisabledOnLight: 'rgba(0, 0, 0, 0.38)',
            textIconOnLight: 'rgba(0, 0, 0, 0.38)',
            textPrimaryOnDark: 'white',
            textSecondaryOnDark: 'rgba(255, 255, 255, 0.7)',
            textHintOnDark: 'rgba(255, 255, 255, 0.5)',
            textDisabledOnDark: 'rgba(255, 255, 255, 0.5)',
            textIconOnDark: 'rgba(255, 255, 255, 0.5)'
        };

    const styles = classNames([
        "mdc-theme--background",
        "mdc-theme--text-primary-on-background",
        {
            "dark-mode": isDarkTheme,
        }
    ]);

    return (
        <ThemeContext.Provider value={{ setTheme, theme }}>
            <RMWCThemeProvider
                options={themeOptions}
            >
                <div
                    className={styles}
                >
                    {children}
                </div>
            </RMWCThemeProvider>
        </ThemeContext.Provider>
    )
});

export const useTheme = () => useContext(ThemeContext);