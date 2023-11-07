import { useState } from "react";
import "./App.css";
import IdeBody from "./IdeBody";
import { isMobile } from "react-device-detect";
import ErrorIsMobile from "./ErrorIsMobile";
import MenuBar from "./Menu";
import { useFileSystem } from "react-local-file-system";
import useSerial from "./useSerial";
import GlobalDarkTheme from "./GlobalDarkTheme";
import useThemeDetector from "./useThemeDetector";

function App() {
    // get folder handler and status with useFileSystem hook
    const { openDirectory, directoryReady, statusText, rootDirHandle } = useFileSystem();
    const { connectToSerialPort, sendDataToSerialPort, serialOutput, isSerialPortConnected } = useSerial();
    const isDarkTheme = useThemeDetector();

    const [menuStructure, setMenuStructure] = useState({
        title: "CircuitPython Online IDE",
        menu: [
            {
                label: "connect",
                options: [
                    {
                        text: "CircuitPy Drive",
                        handler: () => {
                            console.log("clicked on `CircuitPy Drive`");
                            openDirectory();
                        },
                    },
                    {
                        text: "Serial",
                        handler: () => {
                            console.log("clicked on Serial");
                            connectToSerialPort();
                        },
                    },
                ],
            },
            {
                label: "open",
                options: [
                    {
                        text: "Settings",
                        handler: () => {
                            console.log("clicked on Settings");
                        },
                    },
                    {
                        text: "Folder View",
                        handler: () => {
                            console.log("clicked on Folder View");
                        },
                    },
                ],
            },
        ],
    });

    if (isMobile) {
        return <ErrorIsMobile />;
    }

    return (
        <div className="ide">
            <GlobalDarkTheme dark={isDarkTheme} />
            <div className="ide-header">
                <MenuBar menuStructure={menuStructure} />
            </div>
            <div className="ide-body">
                <IdeBody
                    openDirectory={openDirectory}
                    directoryReady={directoryReady}
                    rootDirHandle={rootDirHandle}
                    sendDataToSerialPort={sendDataToSerialPort}
                    serialOutput={serialOutput}
                />
            </div>
            <div className="ide-tail">
                CircuitPy Drive: {statusText} | Serial: {isSerialPortConnected ? "connected" : "not connected"}
            </div>
        </div>
    );
}

export default App;
