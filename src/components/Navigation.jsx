// React
import { useContext } from "react";
//context
import IdeContext from "../contexts/IdeContext";
// mui
import {
    Button,
} from "@mui/material";

export default function Navigation() {

    const { fsApi, serialReady } = useContext(IdeContext);

    return (
        <>
            <p> Please connect your microcontroller to this computer by a usb data cable before following the steps.</p>
            <ul>
                <li>
                    Step 0.
                    <Button
                        onClick={() => {
                            window.open(
                                "https://learn.adafruit.com/welcome-to-circuitpython/installing-circuitpython",
                                "_blank"
                            );
                        }}
                    >
                        Install CircuitPython
                    </Button>
                    (Skip if you already did)
                </li>
                <li>
                    Step 1. <Button onClick={fsApi.openRootDirectory}>Open CircuitPy Drive</Button>
                    {fsApi.directoryReady ? "✅" : ""}
                </li>
                {/* <li>
                    Step 2. <Button onClick={connectToSerialPort}>Connect to Serial Port</Button>
                    {serialReady ? "✅" : ""}
                </li> */}
                {serialReady && fsApi.directoryReady ? <li>🎉 All ready! Close this tab and start coding!</li> : ""}
            </ul>
        </>
    );
}
