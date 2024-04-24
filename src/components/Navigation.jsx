import { useContext } from "react";
import IdeContext from "../contexts/IdeContext";
import { Button } from "@mui/material";

export default function Navigation() {

    const { fsApi, serialApi } = useContext(IdeContext);

    const buttonsSx = {
        width: "120px",
        margin: "0 20px",
        padding: "0px",
    };

    return (
        <>
            <div className="markdown-body"><h2>Navigation</h2>
                <ul>
                    <li>
                        {fsApi.directoryReady ? "✅" : "❌"}&nbsp;
                        <div
                            style={{
                                width: "130px",
                                display: "inline-block",
                            }}
                        >
                            CircuitPy Drive
                        </div>
                        {fsApi.directoryReady ?
                            <Button
                                onClick={fsApi.closeRootDirectory}
                                sx={buttonsSx}
                                variant="contained"
                                color="secondary"
                            >
                                Close
                            </Button> :
                            <Button
                                onClick={fsApi.openRootDirectory}
                                sx={buttonsSx}
                                variant="contained"
                                color="primary"
                            >
                                Open
                            </Button>
                        }
                        {fsApi.directoryStatus}
                    </li>
                    <li>
                        {serialApi.serialStatus ? "✅" : "❌"}&nbsp;
                        <div
                            style={{
                                width: "130px",
                                display: "inline-block",
                            }}
                        >
                            Serial Port
                        </div>
                        {serialApi.serialStatus ?
                            <Button
                                onClick={serialApi.disconnect}
                                sx={buttonsSx}
                                variant="contained"
                                color="secondary"
                            >
                                Disconnect
                            </Button> :
                            <Button
                                onClick={serialApi.connect}
                                sx={buttonsSx}
                                variant="contained"
                                color="primary"
                            >
                                Connect
                            </Button>
                        }
                        {serialApi.connectionState}
                    </li>
                    <li>
                        You can use the Command Palette <code>Ctrl + Shift + Q</code> to access many useful commands.
                    </li>
                </ul>
            </div>
        </>
    );
}
