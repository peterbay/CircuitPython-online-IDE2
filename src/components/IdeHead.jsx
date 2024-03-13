import { useContext } from "react";
import MenuBar from "./MenuBar";
import { activateTab, openTab } from "../utils/tabUtils";
import IdeContext from "../contexts/IdeContext";

export default function IdeHead() {
    const { flexModel: model } = useContext(IdeContext);

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
                            openTab(model, "ASCII table", "ascii_table");
                        },
                    },
                    {
                        text: "Converters",
                        handler: () => {
                            openTab(model, "Converters", "converters");
                        },
                    },
                    {
                        text: "Navigation",
                        handler: () => {
                            openTab(model, "Navigation", "navigation");
                        },
                    },
                    {
                        text: "Dashboard",
                        handler: () => {
                            openTab(model, "Dashboard", "dashboard");
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
                            openTab(model, "Keyboard shortcuts", "keyboard_shortcuts");
                        },
                    },
                    {
                        text: "About",
                        handler: () => {
                            openTab(model, "About", "about");
                        },
                    },
                ],
            },
        ],
    };
    return <MenuBar menuStructure={menuStructure} />;
}
