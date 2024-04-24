import PropTypes from "prop-types";
import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    IconButton,
    Tooltip,
} from "@mui/material";

import {
    TerminalOutlined as SendToTerminalIcon,
} from '@mui/icons-material/';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-tomorrow_night_bright";
import useEditorOptions from "../hooks/useEditorOptions";

import {
    Box,
    Toolbar,
    Divider,
} from "@mui/material";

import {
    Cancel as CancelIcon,
    DeleteForever as DeleteForeverIcon,
    Refresh as RefreshIcon,
    Usb as UsbIcon,
    BorderColor as EditorIcon,
} from '@mui/icons-material';

import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";

import IdeContext from "../contexts/IdeContext";

export default function SerialConsole({ node }) {
    const { configApi, serialApi, paletteApi } = useContext(IdeContext);
    const editorOptions = useEditorOptions({ configApi, isNewFile: false });

    const terminalBox = useRef(null);

    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const fitAddon = useRef(new FitAddon());
    const terminalEditorBoxRef = useRef(null);
    const terminalEditorRef = useRef(null);
    const [terminalEditorValue, setTerminalEditorValue] = useState("");
    const [showEditor, setShowEditor] = useState(false);

    if (!navigator.serial) {
        console.warn("Web Serial API not supported");
    }

    const readerCallback = function (data) {
        terminal.current.write(data);
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

    const editorToggle = function () {
        setShowEditor(!showEditor);
    }

    const height = node.getRect().height;
    const width = node.getRect().width;

    useEffect(() => {
        if (!serialApi.serial) {
            return;
        }
        serialApi.serial.registerReaderCallback('terminal', readerCallback);
        return () => {
            serialApi.serial.unregisterReaderCallback('terminal');
        }
    }, [readerCallback, serialApi.serial]);

    useEffect(() => {
        if (!terminal.current) {
            return;
        }
        fitAddon.current.fit();
    }, [showEditor]);

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

    const sendTextToConsole = function () {
        const lines = terminalEditorValue.split(/\r\n|\r|\n]/);
        serialApi.sendKey("Ctrl+C");

        lines.forEach((line) => {
            serialApi.write(` \r${line}\r\n`);
        });

        serialApi.write(`\r\n`);
    }

    if (terminalEditorRef.current !== null) {
        const commands = terminalEditorRef.current.editor.commands;
        // add key bindings
        commands.addCommand({
            name: "execute",
            bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
            exec: () => {
                sendTextToConsole();
            },
        });
    }

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
                        id="showEditor"
                        title={showEditor ? "Hide editor for serial console"
                            : "Show editor for serial console"}
                        icon={EditorIcon}
                        disabled={false}
                        onClick={() => editorToggle()}
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
                        title="Clear console output"
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
                height: height - 36 - (showEditor ? 164 : 0) + "px",
                background: 'black',
            }}>
                <div ref={terminalRef} style={{
                    marginLeft: "10px",
                    width: (width - 10) + 'px',
                    height: height - 36 - (showEditor ? 164 : 0) + "px"
                }} />
            </Box>
            {showEditor &&
                <>
                    <Divider
                        sx={{
                            borderTop: '2px solid #333',
                        }}
                    />
                    <Box sx={{
                        flexGrow: 1,
                        flexDirection: 'row',
                        display: 'flex',
                        height: "160px",
                    }}>

                        <Box ref={terminalEditorBoxRef} sx={{
                            flexGrow: 1,
                            width: (width - 80) + 'px',
                            height: "160px",
                            background: 'black',
                        }}>
                            <AceEditor
                                ref={terminalEditorRef}
                                mode="python"
                                useSoftTabs={configApi.config.editor.use_soft_tabs}
                                wrapEnabled={true}
                                tabSize={configApi.config.editor.tab_size}
                                theme="tomorrow_night_bright"
                                value={terminalEditorValue}
                                height="100%"
                                width="100%"
                                onChange={(value) => setTerminalEditorValue(value)}
                                fontSize={configApi.config.editor.font + "pt"}
                                setOptions={editorOptions.editorOptions}
                            />
                        </Box>
                        <Box sx={{
                            flexGrow: 1,
                            width: 50 + 'px',
                            height: "160px",
                            background: 'black',
                        }}>
                            <Tooltip
                                key="send-to-terminal"
                                id="send-to-terminal"
                                title="Send text to terminal (Ctrl + Enter)"
                            >
                                <IconButton
                                    edge="start"
                                    size="small"
                                    style={{ borderRadius: 0 }}
                                    onClick={sendTextToConsole}
                                    disabled={!serialApi.serialStatus}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                >
                                    <SendToTerminalIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </>
            }
        </>
    );
}

SerialConsole.propTypes = {
    node: PropTypes.object,
};
