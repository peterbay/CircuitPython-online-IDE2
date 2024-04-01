import PropTypes from "prop-types";
import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

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

import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";

import IdeContext from "../contexts/IdeContext";

export default function SerialConsole({ node }) {
    const { configApi, dashboardApi, serialApi, paletteApi } = useContext(IdeContext);
    const terminalBox = useRef(null);

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
            dashboardApi.processLine(data);
        }
    }.bind(this);

    useEffect(() => {
        if (!terminal.current) {
            const terminalOptions = {
                cursorBlink: true,
                fontSize: configApi.config.serial_console.font_size,
            };

            terminal.current = new Terminal(terminalOptions);
            terminal.current.loadAddon(fitAddon.current);
            terminal.current.open(terminalRef.current);
            terminal.current.attachCustomKeyEventHandler((e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
                    paletteApi.setOpen(true);
                    return false;
                }
                return true;
            });
            fitAddon.current.fit();

            serialApi.setTerminal(terminal.current);

            terminal.current.onData((data) => {
                serialApi.serial.write(data);
            });
        }
    }, [serialApi, configApi.config.serial_console.font_size, paletteApi]);

    const linkToggle = function () {
        setLinked(!linked);
    }

    const height = node.getRect().height;
    const width = node.getRect().width;

    useEffect(() => {
        if (!serialApi.serial) {
            return;
        }
        if (linked) {
            serialApi.serial.setReaderCallback(readerCallback);
        } else {
            serialApi.serial.setReaderCallback(null);
        }
        return () => {
            serialApi.serial.setReaderCallback(null);
        }
    }, [linked, readerCallback, serialApi.serial]);

    useEffect(() => {
        if (!terminal.current) {
            return;
        }
        terminal.current.options.fontSize = configApi.config.serial_console.font_size;
        fitAddon.current.fit();
    }, [configApi.config.serial_console.font_size]);

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
                    <ToolbarEntry>Serial console: {serialApi.connectionState}</ToolbarEntry>

                    <TooltipIconButton
                        id="link-dashboard"
                        title={linked ? "Unlink dashboard from serial console"
                            : "Link dashboard to serial console"}
                        icon={linked ? LinkIcon : LinkOffIcon}
                        disabled={!serialApi.serialStatus}
                        onClick={() => linkToggle()}
                    />

                    <TooltipIconButton
                        id="send-ctrl-c"
                        title="Send Ctrl+C to stop running program"
                        icon={CancelIcon}
                        disabled={!serialApi.serialStatus}
                        onClick={() => serialApi.sendKey("Ctrl+C")}
                    />

                    <TooltipIconButton
                        id="send-ctrl-d"
                        title="Send Ctrl+D to reload the program"
                        icon={RefreshIcon}
                        disabled={!serialApi.serialStatus}
                        onClick={() => serialApi.sendKey("Ctrl+D")}
                    />

                    <TooltipIconButton
                        id="clear-terminal"
                        title="Clear terminal"
                        icon={DeleteForeverIcon}
                        disabled={!terminal.current}
                        onClick={() => serialApi.clearTerminal()}
                    />

                    <TooltipIconButton
                        id="serial-connect"
                        title={serialApi.serialStatus ? "Disconnect from serial port" : "Connect to serial port"}
                        icon={UsbIcon}
                        iconSx={{ color: serialApi.serialStatus ? 'green' : 'blue' }}
                        onClick={() => serialApi.serialStatus ? serialApi.disconnect() : serialApi.connect()}
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

SerialConsole.propTypes = {
    node: PropTypes.object,
};
