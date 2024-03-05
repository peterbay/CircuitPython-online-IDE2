// React
import { useContext } from "react";
import MenuBar from "./layout/Menu";
// Flex layout
import * as FlexLayout from "flexlayout-react";
//context
import ideContext from "./ideContext";

import { getTabsByName, activateTab } from "./tabs/Helpers";

export default function IdeHead() {
    const { flexModel: model, openDirectory } = useContext(ideContext);

    function openTab(name, component) {
        const tabNodes = getTabsByName(model, "root", name, "equal");
        const tabNode = (tabNodes && tabNodes.length > 0) ? tabNodes[0] : null;

        if (tabNode instanceof FlexLayout.TabNode) {
            // Activate the found tab
            model.doAction(FlexLayout.Actions.selectTab(tabNode.getId()));
        } else {
            // Open a new tab
            model.doAction(
                FlexLayout.Actions.addNode(
                    {
                        type: "tab",
                        name: name,
                        component: component,
                    },
                    model.getActiveTabset() ? model.getActiveTabset().getId() : "initial_tabset",
                    FlexLayout.DockLocation.CENTER,
                    -1
                )
            );
        }
    }

    const menuStructure = {
        title: "CircuitPython Online IDE",
        menu: [
            // {
            //     label: "Connect",
            //     options: [
            //         {
            //             text: "CircuitPy Drive",
            //             handler: () => {
            //                 console.log("clicked on `CircuitPy Drive`");
            //                 openDirectory();
            //             },
            //         },
            //         {
            //             text: "Serial Port",
            //             handler: () => {
            //                 console.log("clicked on Serial");
            //                 // connectToSerialPort();
            //             },
            //         },
            //     ],
            // },
            {
                label: "View",
                options: [
                    {
                        text: "Folder View",
                        handler: () => {
                            activateTab(model, "folder_view");
                        },
                    },
                    {
                        text: "Serial Console",
                        handler: () => {
                            activateTab(model, "serial_console");
                        },
                    },
                    {
                        text: "Settings",
                        handler: () => {
                            activateTab(model, "settings");
                        },
                    },
                ],
            },
            {
                label: "Tools",
                options: [
                    {
                        text: "ASCII table",
                        handler: () => {
                            openTab("ASCII table", "ascii_table");
                        },
                    },
                    {
                        text: "Converters",
                        handler: () => {
                            openTab("Converters", "converters");
                        },
                    },
                    {
                        text: "Navigation",
                        handler: () => {
                            openTab("Navigation", "navigation");
                        },
                    },
                    {
                        text: "Dashboard",
                        handler: () => {
                            openTab("Dashboard", "dashboard");
                        },
                    },
                ],
            },
            {
                label: "Help",
                options: [
                    {
                        text: "Keyboard shortcuts",
                        handler: () => {
                            openTab("Keyboard shortcuts", "keyboard_shortcuts");
                        },
                    },
                    {
                        text: "About",
                        handler: () => {
                            openTab("About", "about");
                        },
                    },
                ],
            },
        ],
    };
    return <MenuBar menuStructure={menuStructure} />;
}
