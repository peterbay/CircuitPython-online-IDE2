import { useState, useContext, useEffect } from "react";
import About from "./About";
import Ascii from "./Ascii";
import ConfigForms from "../components/ConfigForms";
import Converters from "./Converters";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import IdeFolderView from "./IdeFolderView";
import KeyboardShortcuts from "./KeyboardShortcuts";
import Navigation from "./Navigation";
import SerialConsole from "./SerialConsole";
import {
    Actions as FlexLayoutActions,
    DockLocation as FlexLayoutDockLocation,
    Layout as FlexLayoutLayout,
    TabNode as FlexLayoutTabNode,
} from "flexlayout-react";
import IdeContext from "../contexts/IdeContext";
import { getTabsByPath, getActiveEditorTabConfig } from "../utils/tabUtils";
import TabContextMenu from "./TabContextMenu.jsx";
import FileCloseDialog from "./FileCloseDialog.jsx";

const fullSize = { height: "100%", width: "100%" };

export default function IdeBody() {
    const { flexModel: model, schemas, config, setConfig } = useContext(IdeContext);
    const [fileLookUp, setFileLookUp] = useState({});
    const [activeEditorInfo, setActiveEditorInfo] = useState(null);
    const [tabContextMenu, setTabContextMenu] = useState(null);
    const [tabsToClose, setTabsToClose] = useState([]);
    const [tabToClose, setTabToClose] = useState(null);
    const [cancelClosing, setCancelClosing] = useState(null);
    const [saveAndClose, setSaveAndClose] = useState(null);

    useEffect(() => {
        if (!tabToClose && tabsToClose.length) {
            setCancelClosing(false);
            setSaveAndClose(null);
            setTabToClose(tabsToClose[0]);
            setTabsToClose((prev) => prev.slice(1));
        }
    }, [tabsToClose, tabToClose]);

    useEffect(() => {
        if (cancelClosing) {
            setTabToClose(null);
            setTabsToClose([]);
        }
    }, [cancelClosing]);

    async function onFileClick(fileHandle, isReadOnly = false, isNewFile = false) {
        const fileName = fileHandle.name;
        const fullPath = fileHandle.fullPath;

        const tabNodes = getTabsByPath(model, "root", fullPath, "equal");
        const tabNode = (tabNodes && tabNodes.length > 0) ? tabNodes[0] : null;

        if (tabNode instanceof FlexLayoutTabNode) {
            // Activate the found tab
            model.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
        } else {
            // Open a new tab
            const fileKey = crypto.randomUUID();
            const activeTabset = model.getActiveTabset();
            setFileLookUp((cur) => {
                return {
                    ...cur,
                    [fileKey]: fileHandle,
                };
            });
            model.doAction(
                FlexLayoutActions.addNode(
                    {
                        type: "tab",
                        name: fileName,
                        component: "editor",
                        config: {
                            fileKey: fileKey,
                            fullPath: fullPath,
                            isReadOnly: isReadOnly,
                            isNewFile: isNewFile,
                        }
                    },
                    activeTabset ? activeTabset.getId() : "left_tabset",
                    FlexLayoutDockLocation.CENTER,
                    -1
                )
            );
        }
    }

    const factory = (node) => {
        const component = node.getComponent();
        let tabContent = null;

        // main ones
        if (component === "editor") {
            const config = node.getConfig();
            tabContent = <Editor
                fileHandle={fileLookUp[config.fileKey]}
                node={node}
                isReadOnly={config.isReadOnly}
                isNewFile={config.isNewFile}
                saveAndClose={saveAndClose}
                setTabToClose={setTabToClose}
            />;

        } else if (component === "folder_view") {
            tabContent = <IdeFolderView
                onFileClick={onFileClick}
                activeEditorInfo={activeEditorInfo}
            />;

        } else if (component === "settings") {
            tabContent = <ConfigForms schemas={schemas} config={config} setConfig={setConfig} />;

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
        const config = await getActiveEditorTabConfig(model);
        await setActiveEditorInfo(config);
    }

    async function onAction(action) {
        if (action.type === "FlexLayout_DeleteTab" && action?.data?.node) {
            const node = model.getNodeById(action.data.node);

            if (!node.isEnableClose()) {
                return;
            }

            if (node && node.getClassName() === "unsaved") {
                setTabsToClose((prev) => {
                    return [...prev, node];
                })
                return;
            }
        }

        await model.doAction(action);
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
                model={model}
                tabContextMenu={tabContextMenu}
                setTabsToClose={setTabsToClose}
            />
            <FileCloseDialog
                model={model}
                tabToClose={tabToClose}
                setTabToClose={setTabToClose}
                setCancelClosing={setCancelClosing}
                setSaveAndClose={setSaveAndClose}
            />
            <FlexLayoutLayout
                model={model}
                factory={factory}
                onAction={onAction}
                onModelChange={updateActiveEditorInfo}
                onRenderTab={updateActiveEditorInfo}
                onContextMenu={onContextMenu}
            />
        </>
    );
}
