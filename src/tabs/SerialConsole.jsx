/* eslint-disable react/prop-types */
// react
import { useEffect, useState, useRef, useContext } from "react";

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// MUI
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import UsbIcon from '@mui/icons-material/Usb';
import UsbOffIcon from '@mui/icons-material/UsbOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

import SerialCommunicator from "../serial/serial";

// context
import ideContext from "../ideContext";

const serial = new SerialCommunicator();

function ToolbarEntry({ content, fixedWidth = null }) {
    const sx = {
        flexGrow: 1,
        pl: 1,
        fontSize: "14px",
    };

    if (fixedWidth) {
        sx.width = fixedWidth;
    }

    return (
        <Typography
            component="div"
            noWrap={true}
            sx={sx}
        >
            {content}
        </Typography>
    );
}

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
                    <Tooltip
                        key={"link-dashboard"}
                        id="link-dashboard"
                        title={linked ? "Unlink dashboard from serial console"
                            : "Link dashboard to serial console"}
                    >
                        <span>
                            <IconButton
                                edge="start"
                                size="small"
                                style={{borderRadius: 0}}
                                onClick={() => {
                                    linkToggle();
                                }}
                                disabled={!serialStatus}
                            >
                                {linked ? <LinkIcon /> : <LinkOffIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip
                        key={""}
                        id=""
                        title={"Send Ctrl+C to stop running program"}
                    >
                        <span>
                            <IconButton
                                edge="start"
                                size="small"
                                style={{borderRadius: 0}}
                                onClick={() => {
                                    sendKey("Ctrl+C");
                                }}
                                disabled={!serialStatus}
                            >
                                <CancelIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip
                        key={"send-ctrl-d"}
                        id="send-ctrl-d"
                        title={"Send Ctrl+D to reload the program"}
                    >
                        <span>
                            <IconButton
                                edge="start"
                                size="small"
                                style={{borderRadius: 0}}
                                onClick={() => {
                                    sendKey("Ctrl+D");
                                }}
                                disabled={!serialStatus}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip
                        key={"clear-terminal"}
                        id="clear-terminal"
                        title={"Clear terminal"}
                    >
                        <span>
                            <IconButton
                                edge="start"
                                size="small"
                                style={{borderRadius: 0}}
                                onClick={() => {
                                    clearTerminal();
                                }}
                                disabled={!terminal.current}
                            >
                                <DeleteForeverIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip
                        key={"serial-connect"}
                        id="serial-connect"
                        title={serialStatus ? "Disconnect from serial port" : "Connect to serial port"}
                    >
                        <IconButton
                            edge="start"
                            size="small"
                            style={{borderRadius: 0}}
                            onClick={() => {
                                serialStatus ? disconnect() : connect();
                            }}
                        >
                            {serialStatus ? <UsbIcon sx={{ color: 'green' }} /> : <UsbIcon sx={{ color: 'blue' }} />}
                        </IconButton>
                    </Tooltip>
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
