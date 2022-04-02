import React, { PropsWithChildren, useContext, useState } from "react";
import { ThemeProvider as RMWCThemeProvider } from "@rmwc/theme";
import classNames from "classnames";

export const ThemeContext = React.createContext({} as {
    setDarkMode: (on: boolean) => void;
    darkMode: boolean;
});

export const ThemeProvider = ({ children }: PropsWithChildren<unknown>) => {

    const [darkMode, setDarkMode] = useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const themeOptions = darkMode
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
            "dark-mode": darkMode
        }
    ]);

    return (
        <ThemeContext.Provider value={{ setDarkMode, darkMode }}>
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
};

export const useTheme = () => useContext(ThemeContext);