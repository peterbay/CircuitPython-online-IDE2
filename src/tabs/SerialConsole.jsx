/* eslint-disable react/prop-types */
import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Terminal,
} from 'xterm';

import {
    FitAddon,
} from 'xterm-addon-fit';

import 'xterm/css/xterm.css';

import {
    Box,
    Toolbar,
    Divider,
} from "@mui/material";

import {
    Cancel as CancelIcon,
    DeleteForever as DeleteForeverIcon,
    Link as LinkIcon,
    LinkOff as LinkOffIcon,
    Refresh as RefreshIcon,
    Usb as UsbIcon,
} from '@mui/icons-material';

import { ToolbarEntry } from "../components/ToolbarEntry";
import { ToolbarIconButton } from "../components/ToolbarIconButton";

import SerialCommunicator from "../serial/serial";

// context
import ideContext from "../ideContext";

const serial = new SerialCommunicator();

export default function SerialConsole({ node }) {
    const { config, processLine } = useContext(ideContext);
    const terminalBox = useRef(null);
    const [serialStatus, setSerialStatus] = useState(false);
    const [connectionState, setConnectionState] = useState("Not connected");
    const [linked, setLinked] = useState(true);

    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(new FitAddon());

    if (!navigator.serial) {
        console.warn("Web Serial API not supported");
    }

    const readerCallback = function (data) {
        terminal.current.write(data);
        if (linked) {
            processLine(data);
        }
    }.bind(this);

    const connect = async function () {
        if (!terminal.current) {

            const terminalOptions = {
                cursorBlink: true,
                fontSize: config.serial_console.font_size,
            };

            terminal.current = new Terminal(terminalOptions);
            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            fitAddon.current.fit();

            terminal.current.onData((data) => {
                serial.write(data);
            });

            serial.setReaderCallback(readerCallback);
        }

        const status = await serial.open();
        setSerialStatus(status);
        if (!status) {
            serial.close();
            setConnectionState("Failed to open serial port");
            console.error("Failed to open serial port");
        } else {
            setConnectionState("Connected");
        }
    };

    const disconnect = function () {
        serial.close();
        setSerialStatus(false);
        setConnectionState("Disconnected");
    };

    const clearTerminal = function () {
        if (!terminal.current) {
            return;
        }
        terminal.current.clear();
    };

    const sendKey = function (key) {
        if (!serialStatus) {
            return;
        }

        const keys = {
            "Ctrl+C": "\x03",
            "Ctrl+D": "\x04",
            "Ctrl+Z": "\x1A",
            "Ctrl+L": "\x0C",
            "Ctrl+R": "\x12",
            "Ctrl+T": "\x14",
            "Ctrl+U": "\x15",
            "Ctrl+W": "\x17",
            "Ctrl+Y": "\x19",
        };

        if (keys[key]) {
            serial.write(keys[key]);
        }
    };

    const linkToggle = function () {
        setLinked(!linked);
    }

    const height = node.getRect().height;
    const width = node.getRect().width;

    useEffect(() => {
        serial.setReaderCallback(readerCallback);
    }, [linked]);

    useEffect(() => {
        if (!terminal.current) {
            return;
        }
        terminal.current.options.fontSize = config.serial_console.font_size;
        fitAddon.current.fit();
    }, [config.serial_console.font_size]);

    useEffect(() => {
        if (terminalBox.current === null) {
            return;
        }
        fitAddon.current.fit();
    }, [height, width]);

    return (
        <>
            <Box sx={{ flexGrow: 0, maxHeight: "35px" }}>
                <Divider />
                <Toolbar
                    variant="dense"
                    disableGutters={true}
                    sx={{ minHeight: "35px", maxHeight: "35px" }}
                >
                    <ToolbarEntry content={`Serial console: ${connectionState}`} />

                    <ToolbarIconButton
                        id="link-dashboard"
                        title={linked ? "Unlink dashboard from serial console"
                        : "Link dashboard to serial console"}
                        icon={linked ? LinkIcon : LinkOffIcon}
                        disabled={!serialStatus}
                        onClick={() => linkToggle()}
                    />

                    <ToolbarIconButton
                        id="send-ctrl-c"
                        title="Send Ctrl+C to stop running program"
                        icon={CancelIcon}
                        disabled={!serialStatus}
                        onClick={() => sendKey("Ctrl+C")}
                    />

                    <ToolbarIconButton
                        id="send-ctrl-d"
                        title="Send Ctrl+D to reload the program"
                        icon={RefreshIcon}
                        disabled={!serialStatus}
                        onClick={() => sendKey("Ctrl+D")}
                    />

                    <ToolbarIconButton
                        id="clear-terminal"
                        title="Clear terminal"
                        icon={DeleteForeverIcon}
                        disabled={!terminal.current}
                        onClick={() => clearTerminal()}
                    />

                    <ToolbarIconButton
                        id="serial-connect"
                        title={serialStatus ? "Disconnect from serial port" : "Connect to serial port"}
                        icon={UsbIcon}
                        iconSx={{ color: serialStatus ? 'green' : 'blue' }}
                        onClick={() => serialStatus ? disconnect() : connect()}
                    />
                </Toolbar>
            </Box>
            <Box ref={terminalBox} sx={{
                flexGrow: 1,
                width: width + 'px',
                height: "calc(" + height + "px - 36px)",
                background: 'black',
            }}>
                <div ref={terminalRef} style={{
                    marginLeft: "10px",
                    width: (width - 10) + 'px',
                    height: "calc(" + height + "px - 36px)"
                }} />
            </Box>
        </>
    );
}
