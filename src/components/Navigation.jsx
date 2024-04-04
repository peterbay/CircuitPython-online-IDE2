import { useContext } from "react";
import IdeContext from "../contexts/IdeContext";
import { Button } from "@mui/material";

export default function Navigation() {

    const { fsApi, serialApi } = useContext(IdeContext);

    return (
        <>
            <div className="markdown-body"><h2>Navigation</h2>
                <ul>
                    <li>
                        {fsApi.directoryReady ? "✅" : "❌"}&nbsp;CircuitPy Drive - {fsApi.directoryStatus}&nbsp;
                        {fsApi.directoryReady ?
                            <Button onClick={fsApi.closeRootDirectory}>Close</Button> :
                            <Button onClick={fsApi.openRootDirectory}>Open</Button>
                        }
                    </li>
                    <li>
                        {serialApi.serialStatus ? "✅" : "❌"}&nbsp;Serial Port - {serialApi.connectionState}&nbsp;
                        {serialApi.serialStatus ?
                            <Button onClick={serialApi.disconnect}>Disconnect</Button> :
                            <Button onClick={serialApi.connect}>Connect</Button>
                        }
                    </li>
                    <li>
                        You can use the Command Palette <code>Ctrl + Shift + Q</code> to access many useful commands. 
                    </li>
                </ul>
            </div>
        </>
    );
}
