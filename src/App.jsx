// React
import { useState, useEffect } from "react";
// Style
import "./App.css";
// Ide parts
import IdeBody from "./IdeBody";
import IdeHead from "./IdeHead";
// Device Support Warnings
import { isMobile, isMacOs, isSafari, isFirefox, isIE } from "react-device-detect";
import ErrorIsMobile from "./infopages/ErrorIsMobile";
import ErrorIsNotChrome from "./infopages/ErrorIsNotChrome";
import WarningIsMac from "./infopages/WarningIsMac";
// Features
import { useFileSystem } from "./react-local-file-system";
import { useConfig } from "./react-user-config";
import schemas from "./schemas";
import { dashboardContent } from "./dashboard";
// context
import ideContext from "./ideContext";

// layout
import * as FlexLayout from "flexlayout-react";
import layout from "./layout/layout.json";
import {
    getThemeClassByLabel,
    getThemesNamesList,
    getDefaultTheme,
    getThemeTypeByLabel,
    getSystemTheme
} from "./layout/themes.js";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

function App() {
    // get folder handler and status with useFileSystem hook
    const { openDirectory, directoryReady, statusText, rootDirHandle } = useFileSystem();
    const { dashboardLayout, clearDashboard, processLine, widgets, updateWidget } = dashboardContent();
    const { config, set_config, ready: configReady } = useConfig(schemas);
    const [flexModel, setFlexModel] = useState(FlexLayout.Model.fromJson(layout));

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

    console.log("isDarkTheme", isDarkTheme);

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

    // error info
    let WarningModal = () => {};
    if (isMobile) {
        WarningModal = ErrorIsMobile;
    } else if (isSafari || isFirefox || isIE) {
        WarningModal = ErrorIsNotChrome;
    } else if (isMacOs) {
        WarningModal = WarningIsMac;
    }

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
    const classes = `ide ${themeClass}`;
    const muiTheme = (getThemeTypeByLabel(themeLabel) === "dark") ? darkTheme : lightTheme;

    return (
        <ideContext.Provider
            value={{
                flexModel: flexModel,
                openDirectory: openDirectory,
                directoryReady: directoryReady,
                rootDirHandle: rootDirHandle,
                schemas: schemas,
                config: config,
                set_config: set_config,
                dashboardLayout: dashboardLayout,
                processLine: processLine,
                clearDashboard: clearDashboard,
                widgets: widgets,
                updateWidget: updateWidget,
            }}
        >
            <WarningModal />
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
        </ideContext.Provider>
    );
}

export default App;
