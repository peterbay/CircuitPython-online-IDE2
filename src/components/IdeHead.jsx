import { useContext } from "react";
import MenuBar from "./MenuBar";
import IdeContext from "../contexts/IdeContext";

export default function IdeHead() {
    const { tabsApi, fsApi, serialApi } = useContext(IdeContext);

    const menuStructure = {
        title: "CP Online IDE",
        menu: [
            {
                label: "Connection",
                options: [
                    {
                        text: fsApi.directoryReady ? "✅ Close CircuitPy Drive" : "❌ Open CircuitPy Drive",
                        handler: () => {
                            fsApi.directoryReady ? fsApi.closeRootDirectory() : fsApi.openRootDirectory();
                        },
                    },
                    {
                        text: serialApi.serialStatus ? "✅ Disconnect Serial Port" : "❌ Connect Serial Port",
                        handler: () => {
                            serialApi.serialStatus ? serialApi.disconnect : serialApi.connect();
                        },
                    },
                ],
            },
            {
                label: "View",
                options: [
                    {
                        text: "Folder View",
                        handler: () => {
                            tabsApi.tabShow("folder_view");
                        },
                    },
                    {
                        text: "Serial Console",
                        handler: () => {
                            tabsApi.tabShow("serial_console");
                        },
                    },
                    {
                        text: "Settings",
                        handler: () => {
                            tabsApi.tabShow("settings");
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
