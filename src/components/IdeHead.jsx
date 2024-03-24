import { useContext } from "react";
import MenuBar from "./MenuBar";
import IdeContext from "../contexts/IdeContext";

export default function IdeHead() {
    const { tabsApi } = useContext(IdeContext);

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
            //                 openRootDirectory();
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
                            tabsApi.tabActivate("folder_view");
                        },
                    },
                    {
                        text: "Serial Console",
                        handler: () => {
                            tabsApi.tabActivate("serial_console");
                        },
                    },
                    {
                        text: "Settings",
                        handler: () => {
                            tabsApi.tabActivate("settings");
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
                            tabsApi.tabOpen("ASCII table", "ascii_table");
                        },
                    },
                    {
                        text: "Converters",
                        handler: () => {
                            tabsApi.tabOpen("Converters", "converters");
                        },
                    },
                    {
                        text: "Navigation",
                        handler: () => {
                            tabsApi.tabOpen("Navigation", "navigation");
                        },
                    },
                    {
                        text: "Dashboard",
                        handler: () => {
                            tabsApi.tabOpen("Dashboard", "dashboard");
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
                            tabsApi.tabOpen("Keyboard shortcuts", "keyboard_shortcuts");
                        },
                    },
                    {
                        text: "About",
                        handler: () => {
                            tabsApi.tabOpen("About", "about");
                        },
                    },
                ],
            },
        ],
    };
    return <MenuBar menuStructure={menuStructure} />;
}
