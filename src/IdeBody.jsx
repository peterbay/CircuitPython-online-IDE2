/* eslint-disable react/prop-types */
// React
import { useState, useContext } from "react";
// Tabs
import IdeFolderView from "./tabs/IdeFolderView";
import IdeEditor from "./tabs/IdeEditor";
import { ConfigForms } from "./react-user-config";
import Navigation from "./tabs/Navigation";
import Dashboard from "./tabs/Dashboard";
import SerialConsole from "./tabs/SerialConsole";
import About from "./infopages/About";
import KeyboardShortcuts from "./infopages/KeyboardShortcuts";
import ContactMe from "./infopages/ContactMe";
import Ascii from "./infopages/Ascii";
import Converters from "./infopages/Converters";
// Flex layout
import * as FlexLayout from "flexlayout-react";
//context
import ideContext from "./ideContext";
// tab helpers
import { getTabsByPath, getActiveEditorTabConfig } from "./tabs/Helpers";

const fullSize = { height: "100%", width: "100%" };

export default function IdeBody() {
    const { flexModel: model, schemas, config, set_config } = useContext(ideContext);
    const [fileLookUp, setFileLookUp] = useState({});
    const [activeEditorInfo, setActiveEditorInfo] = useState(null);

    async function onFileClick(fileHandle, isReadOnly = false, isNewFile = false) {
        const fileName = fileHandle.name;
        const fullPath = fileHandle.fullPath;

        const tabNodes = getTabsByPath(model, "root", fullPath, "equal");
        const tabNode = (tabNodes && tabNodes.length > 0) ? tabNodes[0] : null;

        if (tabNode instanceof FlexLayout.TabNode) {
            // Activate the found tab
            model.doAction(FlexLayout.Actions.selectTab(tabNode.getId()));
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
                FlexLayout.Actions.addNode(
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
                    activeTabset ? activeTabset.getId() : "initial_tabset",
                    FlexLayout.DockLocation.CENTER,
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
            tabContent = <IdeEditor
                fileHandle={fileLookUp[config.fileKey]}
                node={node}
                isReadOnly={config.isReadOnly}
                isNewFile={config.isNewFile}
            />;

        } else if (component === "folder_view") {
            tabContent = <IdeFolderView
                onFileClick={onFileClick}
                node={node}
                activeEditorInfo={activeEditorInfo}
            />;

        } else if (component === "settings") {
            tabContent = <ConfigForms schemas={schemas} config={config} set_config={set_config} />;

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

        } else if (component === "contact") {
            tabContent = <ContactMe />;

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

    return <FlexLayout.Layout
        model={model}
        factory={factory}
        onAction={async (action) => {
            await model.doAction(action);
            await updateActiveEditorInfo();
        }}
        onModelChange={updateActiveEditorInfo}
        onRenderTab={updateActiveEditorInfo}
    />;
}
