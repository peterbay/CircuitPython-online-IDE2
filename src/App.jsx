// React
import { useState, useEffect } from "react";
import merge from "lodash/merge";
// Ide parts
import IdeBody from "./components/IdeBody.jsx";
import IdeHead from "./components/IdeHead.jsx";
import ShowWarning from "./components/ShowWarning.jsx";
// Features
import useConfig from "./hooks/useConfig.jsx";
import useDasboard from "./hooks/useDashboard.jsx";
import useEditor from "./hooks/useEditor.jsx";
import useFileSystem from "./hooks/useFileSystem.jsx";
import useGlobalStates from "./hooks/useGlobalStates.jsx";
import usePalette from "./hooks/usePalette.jsx";
import useSerial from "./hooks/useSerial.jsx";
import useTabs from "./hooks/useTabs.jsx";
import useInfo from "./hooks/useInfo.jsx";

// context
import IdeContext from "./contexts/IdeContext";

import configGlobal from "./settings/configGlobal";
import configEditor from "./settings/configEditor";
import configSerialConsole from "./settings/configSerialConsole";

// layout
import {
    Model as FlexLayoutModel,
} from "flexlayout-react";

import { SnackbarProvider } from 'notistack'

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

const themeComponentsOverride = {
    MuiInputBase: {
        styleOverrides: {
            input: {
                paddingTop: "8px !important",
                paddingBottom: "8px !important",
            }
        },
    },
    MuiGrid: {
        styleOverrides: {
            item: {
                paddingTop: "5px !important",
                paddingBottom: "5px !important",
                marginBottom: "8px !important",
            }
        },
    },
    MuiMenuItem: {
        styleOverrides: {
            root: {
                height: "35px",
                fontSize: "15px",
                fontWeight: "400",
            },
        },
    },
    MuiBreadcrumbs: {
        styleOverrides: {
            separator: {
                marginRight: "2px",
                marginLeft: "2px",
            },
        },
    },
 };

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    components: merge(themeComponentsOverride, {
        MuiIconButton: {
            defaultProps: {
                sx: { color: "rgb(157, 157, 157)" },
            },
        },
    }),
});

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
    components: merge(themeComponentsOverride, {}),
});

// update theme list in schemas
const globalSchema = schemas.find((schema) => schema.title === "Global");
if (globalSchema) {
    globalSchema.properties.theme.enum = getThemesNamesList();
    globalSchema.properties.theme.default = getDefaultTheme();
}

const flexModel = FlexLayoutModel.fromJson(layout);

function App() {

    const statesApi = useGlobalStates();
    const infoApi = useInfo();
    const configApi = useConfig({ schemas, statesApi, infoApi });
    const editorApi = useEditor({ configApi, statesApi, infoApi });
    const fsApi = useFileSystem({ statesApi, infoApi });
    const serialApi = useSerial({ configApi, statesApi, infoApi });
    const tabsApi = useTabs({ flexModel, fsApi, statesApi, infoApi });
    const dashboardApi = useDasboard({ statesApi, infoApi });
    const paletteApi = usePalette({ statesApi, infoApi });

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
        if (!fsApi.directoryReady) {
            return;
        }
        window.onbeforeunload = function (e) {
            var dialogText = "Are you sure to leave?"; // TODO: not shown up yet
            e.returnValue = dialogText;
            return dialogText;
        };
    }, [fsApi.directoryReady]);

    // If config initialization not done, don't continue.
    if (!configApi.ready) {
        return;
    }

    let themeLabel = configApi.config.global.theme;
    let themeType = getThemeTypeByLabel(themeLabel);

    if (themeType === "system") {
        themeLabel = getSystemTheme(isDarkTheme);
    }

    const themeClass = getThemeClassByLabel(themeLabel);
    const themeName = getThemeNameByLabel(themeLabel);
    const themeModeClass = (themeType === "dark") ? "is-dark-theme" : "is-light-theme";
    const classes = `ide ${themeClass} ${themeModeClass} ${themeName}`;
    const muiTheme = (getThemeTypeByLabel(themeLabel) === "dark") ? darkTheme : lightTheme;

    const themeApi = {
        themeLabel,
        themeName,
        themeType,
        themeClass,
        themeModeClass,
        muiTheme,
        isDarkMode: getThemeTypeByLabel(themeLabel) === "dark",
    };

    const ideProviderValue = {
        flexModel,
        configApi,
        dashboardApi,
        editorApi,
        fsApi,
        paletteApi,
        serialApi,
        statesApi,
        tabsApi,
        themeApi,
        infoApi,
    };

    return (
        <IdeContext.Provider value={ideProviderValue}>
            <ShowWarning />
            <SnackbarProvider
                maxSnack={5}
                dense={true}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
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
                </div>
            </ThemeProvider>
        </IdeContext.Provider>
    );
}

export default App;
