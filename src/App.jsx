// React
import { useState, useEffect } from "react";
// Ide parts
import IdeBody from "./components/IdeBody.jsx";
import IdeHead from "./components/IdeHead.jsx";
// Device Support Warnings
import { isMobile, isMacOs, isSafari, isFirefox, isIE } from "react-device-detect";
import ShowWarning from "./components/ShowWarning.jsx";
// Features
import useFileSystem from "./hooks/useFileSystem";
import useConfig from "./utils/useConfig.js";
import useDasboard from "./hooks/useDashboard.jsx";
// context
import IdeContext from "./contexts/IdeContext.js";

import configGlobal from "./settings/configGlobal";
import configEditor from "./settings/configEditor";
import configSerialConsole from "./settings/configSerialConsole";

// layout
import {
    Model as FlexLayoutModel,
} from "flexlayout-react";

import layout from "./settings/layout";

import {
    getDefaultTheme,
    getSystemTheme,
    getThemeClassByLabel,
    getThemesNamesList,
    getThemeTypeByLabel,
    getThemeNameByLabel,
} from "./utils/themes.js";

import {
    createTheme,
    ThemeProvider,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const schemas = [configGlobal, configEditor, configSerialConsole];

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: {
        MuiIconButton: {
            defaultProps: {
                sx: { color: "rgb(157, 157, 157)" },
            },
        },
        // MuiButton: {
        //     defaultProps: {
        //         // sx: { color: "rgb(157, 157, 157)" },
        //     },
        // },
    },
});

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

// update theme list in schemas
const globalSchema = schemas.find((schema) => schema.title === "Global");
if (globalSchema) {
    globalSchema.properties.theme.enum = getThemesNamesList();
    globalSchema.properties.theme.default = getDefaultTheme();
}

const flexModel = FlexLayoutModel.fromJson(layout);

function App() {
    // get folder handler and status with useFileSystem hook
    const { openDirectory, directoryReady, rootDirHandle } = useFileSystem();
    const { dashboardLayout, clearDashboard, processLine, widgets, updateWidget } = useDasboard();
    const { config, setConfig, ready: configReady } = useConfig(schemas);

    const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
    const mqListener = (e => {
        setIsDarkTheme(e.matches);
    });

    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMq.addListener(mqListener);
        return () => darkThemeMq.removeListener(mqListener);
    }, []);

    useEffect(() => {
        // https://stackoverflow.com/a/47477519/7037749
        if (directoryReady) {
            window.onbeforeunload = function (e) {
                var dialogText = "Are you sure to leave?"; // TODO: not shown up yet
                e.returnValue = dialogText;
                return dialogText;
            };
        }
    }, [directoryReady]);

    // If config initialization not done, don't continue.
    if (!configReady) {
        return;
    }

    let themeLabel = config.global.theme;
    let themeType = getThemeTypeByLabel(themeLabel);

    if (themeType === "system") {
        themeLabel = getSystemTheme(isDarkTheme);
    }

    const themeClass = getThemeClassByLabel(themeLabel);
    const themeName = getThemeNameByLabel(themeLabel);
    const themeModeClass = (themeType === "dark") ? "is-dark-theme" : "is-light-theme";
    const classes = `ide ${themeClass} ${themeModeClass}`;
    const muiTheme = (getThemeTypeByLabel(themeLabel) === "dark") ? darkTheme : lightTheme;

    return (
        <IdeContext.Provider
            value={{
                flexModel: flexModel,
                openDirectory: openDirectory,
                directoryReady: directoryReady,
                rootDirHandle: rootDirHandle,
                schemas: schemas,
                config: config,
                setConfig: setConfig,
                dashboardLayout: dashboardLayout,
                processLine: processLine,
                clearDashboard: clearDashboard,
                widgets: widgets,
                updateWidget: updateWidget,
                isDarkMode: getThemeTypeByLabel(themeLabel) === "dark",
                themeName: themeName,
            }}
        >
            <ShowWarning
                isMobile={isMobile}
                isNotChrome={isSafari || isFirefox || isIE}
                isMac={isMacOs}
            />
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <div className={classes}>
                    <div className="ide-header">
                        <IdeHead />
                    </div>
                    <div className="ide-body">
                        <IdeBody />
                    </div>
                    <div className="ide-tail">
                        {/* CircuitPy Drive: {statusText} | Serial:{" "} */}
                        {/* {serialReady ? (serialTitle ? serialTitle : "Connected") : "No Port Connected"} */}
                    </div>
                </div>
            </ThemeProvider>
        </IdeContext.Provider>
    );
}

export default App;
