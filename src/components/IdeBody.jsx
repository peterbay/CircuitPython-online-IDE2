import { useState, useContext } from "react";
import { Layout } from "flexlayout-react";

import About from "./About";
import Ascii from "./Ascii";
import ConfigForms from "../components/ConfigForms";
import Converters from "./Converters";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import FileCloseDialog from "./FileCloseDialog.jsx";
import FsActionDialog from "./FsActionDialog";
import IdeContext from "../contexts/IdeContext";
import IdeFolderView from "./IdeFolderView";
import KeyboardShortcuts from "./KeyboardShortcuts";
import Navigation from "./Navigation";
import SerialConsole from "./SerialConsole";
import TabContextMenu from "./TabContextMenu.jsx";

const fullSize = { height: "100%", width: "100%" };

export default function IdeBody() {

    const { flexModel, fsApi, tabsApi } = useContext(IdeContext);

    const [tabContextMenu, setTabContextMenu] = useState(null);

    const factory = (node) => {
        const component = node.getComponent();
        let tabContent = null;

        // main ones
        if (component === "editor") {
            const config = node.getConfig();
            tabContent = fsApi.fileLookUp[config.fullPath] ?
                <Editor
                    fileHandle={fsApi.fileLookUp[config.fullPath]?.fileHandle}
                    node={node}
                    isNewFile={config.isNewFile}
                /> : null;

        } else if (component === "folder_view") {
            tabContent = <IdeFolderView />;

        } else if (component === "settings") {
            tabContent = <ConfigForms />;

        }
        // tools
        else if (component === "navigation") {
            tabContent = <Navigation />;

        } else if (component === "dashboard") {
            tabContent = <Dashboard node={node} />;

        } else if (component === "ascii_table") {
            tabContent = <Ascii node={node} />;

        } else if (component === "converters") {
            tabContent = <Converters node={node} />;

        } else if (component === "serial_console") {
            tabContent = <SerialConsole node={node} />;

        }
        // info
        else if (component === "about") {
            tabContent = <About />;

        } else if (component === "keyboard_shortcuts") {
            tabContent = <KeyboardShortcuts />;

        }
        // placeholder
        else if (component === "placeholder") {
            tabContent = (<p>{node.getName()}</p>);

        }

        return tabContent ? (
            <div className="tab_content" style={fullSize}>
                {tabContent}
            </div>
        ) : null;
    };

    async function updateActiveEditorInfo() {
        const config = await tabsApi.getActiveEditorTabConfig(flexModel);
        await fsApi.setActiveFileFullPath(config?.fullPath);
    }

    async function onAction(action) {
        if (action.type === "FlexLayout_DeleteTab" && action?.data?.node) {
            const node = flexModel.getNodeById(action.data.node);

            if (!node.isEnableClose()) {
                return;
            }

            if (node && node.getClassName() === "unsaved") {
                tabsApi.setTabsToClose((prev) => {
                    return [...prev, node];
                })
                return;
            }

            fsApi.fileClosed(node);
        }

        await flexModel.doAction(action);
        await updateActiveEditorInfo();
    }

    async function onContextMenu(node, event) {
        event && event.preventDefault();
        if (node.getType() !== "tab" || !node.isEnableClose()) {
            return;
        }
        setTabContextMenu({ node, event });
    }

    return (
        <>
            <TabContextMenu
                tabContextMenu={tabContextMenu}
            />
            <FileCloseDialog />
            <FsActionDialog />
            <Layout
                model={flexModel}
                factory={factory}
                onAction={onAction}
                onModelChange={updateActiveEditorInfo}
                onRenderTab={updateActiveEditorInfo}
                onContextMenu={onContextMenu}
            />
        </>
    );
}
