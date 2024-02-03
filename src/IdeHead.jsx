// React
import { useContext } from "react";
import MenuBar from "./layout/Menu";
// Flex layout
import * as FlexLayout from "flexlayout-react";
//context
import ideContext from "./ideContext";

import { getTabsByName } from "./tabs/Helpers";

export default function IdeHead() {
    const { flexModel: model, openDirectory, connectToSerialPort } = useContext(ideContext);

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
            {
                label: "Connect",
                options: [
                    {
                        text: "CircuitPy Drive",
                        handler: () => {
                            console.log("clicked on `CircuitPy Drive`");
                            openDirectory();
                        },
                    },
                    {
                        text: "Serial Port",
                        handler: () => {
                            console.log("clicked on Serial");
                            connectToSerialPort();
                        },
                    },
                ],
            },
            {
                label: "Tools",
                options: [
                    {
                        text: "Navigation",
                        handler: () => {
                            openTab("Navigation", "navigation");
                        },
                    },
                    {
                        text: "Plot",
                        handler: () => {
                            openTab("Plot", "raw_plot");
                        },
                    },
                ],
            },
            {
                label: "Help",
                options: [
                    {
                        text: "About",
                        handler: () => {
                            openTab("About", "about");
                        },
                    },
                    {
                        text: "Contact Me",
                        handler: () => {
                            openTab("Contact Me", "contact");
                        },
                    },
                ],
            },
        ],
    };
    return <MenuBar menuStructure={menuStructure} />;
}
