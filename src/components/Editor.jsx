import PropTypes from "prop-types";

// react
import { useEffect, useState, useRef, useContext } from "react";

// ace
import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-toml";

// light themes
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/theme-cloud9_day";
import "ace-builds/src-noconflict/theme-clouds";
import "ace-builds/src-noconflict/theme-crimson_editor";
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-iplastic";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-sqlserver";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-xcode";

// dark themes
import "ace-builds/src-noconflict/theme-ambiance";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/theme-cloud9_night";
import "ace-builds/src-noconflict/theme-cobalt";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/theme-kr_theme";
import "ace-builds/src-noconflict/theme-merbivore_soft";
import "ace-builds/src-noconflict/theme-merbivore";
import "ace-builds/src-noconflict/theme-mono_industrial";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-nord_dark";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-tomorrow_night_bright";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/theme-twilight";

import {
    Save as SaveIcon,
} from "@mui/icons-material";

import {
    Box,
    Divider,
    Toolbar,
} from "@mui/material";

import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";
import { fileReadText, fileWriteText } from "../utils/fsUtils";
import IdeContext from "../contexts/IdeContext";
import { Actions as FlexLayoutActions } from "flexlayout-react";

import { switchTab } from "../utils/tabUtils";

const editorModes = {
    py: {
        mode: "python",
        label: "Python",
    },
    md: {
        mode: "markdown",
        label: "Markdown",
    },
    json: {
        mode: "json",
        label: "JSON",
    },
    html: {
        mode: "html",
        label: "HTML",
    },
    toml: {
        mode: "toml",
        label: "TOML",
    },
};

const defaultEditorMode = {
    mode: "text",
    label: "Text",
};

export default function Editor({ fileHandle, node, isReadOnly, isNewFile, saveAndClose, setTabToClose }) {
    const { config, themeName } = useContext(IdeContext);
    const aceEditorRef = useRef(null);

    const [configNewLine, setConfigNewLine] = useState(false);
    const [configWordWrap, setConfigWordWrap] = useState(false);
    const [editorCursorInfo, setEditorCursorInfo] = useState(false);
    const [editorNewLineCharacter, setEditorNewLineCharacter] = useState(false);
    const [editorSelectedLength, setEditorSelectedLength] = useState(false);
    const [fileEdited, setFileEdited] = useState(false);
    const [selectionInfo, setSelectionInfo] = useState(false);
    const [tabInfo, setTabInfo] = useState(false);
    const [text, setText] = useState("");
    const [fileIsLoaded, setFileIsLoaded] = useState(false);
    const [editorOptions, setEditorOptions] = useState({});

    const height = node.getRect().height;
    const fileNameLower = fileHandle.name.toLowerCase();
    const extensionMatch = fileNameLower.match(/\.([^.]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : "";
    const editorMode = (editorModes[extension] || defaultEditorMode).mode;
    const editorModeLabel = (editorModes[extension] || defaultEditorMode).label;
    const stateInfo = isReadOnly ? "Read Only" : (fileEdited ? "Unsaved" : "Saved");

    useEffect(() => {
        if (saveAndClose && saveAndClose.getId() === node.getId()) {
            fileWriteText(fileHandle, text);
            node.getModel().doAction(FlexLayoutActions.deleteTab(node.getId(), name));
            setTabToClose(null);
        }
    }, [node, saveAndClose, fileHandle, text, setTabToClose]);

    useEffect(() => {
        setConfigWordWrap(config.editor.wrap);
        if (isNewFile) {
            setConfigNewLine(config.editor.newline_mode);
        } else {
            setConfigNewLine("auto");
        }
    }, [isNewFile, config.editor.wrap, config.editor.newline_mode]);

    useEffect(() => {
        const line = (editorCursorInfo.row || 0) + 1;
        const column = (editorCursorInfo.column || 0) + 1;
        const selectedLength = editorSelectedLength ?
            "(" + editorSelectedLength.toString() + " selected)" : "";
        setSelectionInfo(`Ln ${line}, Col ${column} ${selectedLength}`);
    }, [editorCursorInfo, editorSelectedLength]);

    useEffect(() => {
        const softTabs = (config.editor.use_soft_tabs === "spaces");
        const softTabsLabel = softTabs ? "Spaces" : "Tabs";
        const tabSize = config.editor.tab_size;
        setTabInfo(`${softTabsLabel}: ${tabSize}`);
    }, [config.editor.use_soft_tabs, config.editor.tab_size]);

    useEffect(() => {
        let namePrefix = "";
        if (isReadOnly) {
            namePrefix = `🔒 `;
        } else if (fileEdited) {
            namePrefix = `✏️ `;
        }

        const name = `${namePrefix}${fileHandle.name}`;
        const model = node.getModel();
        const nodeId = node.getId();

        model.doAction(FlexLayoutActions.renameTab(nodeId, name));

        const action = FlexLayoutActions.updateNodeAttributes(nodeId, {
            className: fileEdited ? "unsaved" : "",
        });

        model.doAction(action);

    }, [node, isReadOnly, fileEdited, fileHandle.name]);

    useEffect(() => {
        async function loadText() {
            const fileText = (await fileReadText(fileHandle));
            setText(fileText);
            setFileEdited(false);
            setFileIsLoaded(true);
        }
        loadText();
    }, [fileHandle]);

    useEffect(() => {
        setEditorOptions({
            cursorStyle: "shooth", // "ace"|"slim"|"smooth"|"wide"
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: config.editor.live_autocompletion,
            enableSnippets: false,
            highlightActiveLine: config.editor.highlight_active_line,
            highlightSelectedWord: config.editor.highlight_selected_word,
            hScrollBarAlwaysVisible: true,
            newLineMode: configNewLine,
            printMarginColumn: config.editor.print_margin_column,
            showInvisibles: config.editor.show_invisibles,
            showLineNumbers: config.editor.show_line_numbers,
            showPrintMargin: config.editor.show_print_margin,
            tabSize: config.editor.tab_size,
            useSoftTabs: (config.editor.use_soft_tabs === "spaces"),
            vScrollBarAlwaysVisible: true,
            wrap: configWordWrap,
        });
    }, [config.editor, configWordWrap, configNewLine]);

    function saveFile(text) {
        fileWriteText(fileHandle, text);
        setFileEdited(false);
    }

    function onEditorChange(newValue) {
        setText(newValue);
        setFileEdited(true);
    }

    function onEditorLoad(editor) {
        if (!editor) {
            return;
        }
        editor.session.getUndoManager().reset();
    }

    function onEditorCursorChange(selection) {
        const session = aceEditorRef.current.editor.session;
        setEditorCursorInfo(selection.getCursor());

        const range = selection.getRange();
        const textRange = session.getTextRange(range);
        setEditorSelectedLength(textRange.length);

        const newLineCharacter = session.doc.getNewLineCharacter();
        setEditorNewLineCharacter(newLineCharacter === "\n" ? "LF" : "CRLF");
    }

    if (aceEditorRef.current !== null) {
        const commands = aceEditorRef.current.editor.commands;
        // add key bindings
        commands.addCommand({
            name: "save",
            bindKey: { win: "Ctrl-S", mac: "Command-S" },
            exec: () => {
                saveFile(text);
            },
        });
        commands.addCommand({
            name: "word_wrap",
            bindKey: { win: "Alt-Z", mac: "Alt-Z" },
            exec: () => {
                setConfigWordWrap(!configWordWrap);
                aceEditorRef.current.editor.session.setUseWrapMode(configWordWrap);
            },
        });
        commands.addCommand({
            name: "switch_folder_view",
            bindKey: { win: "Ctrl-B", mac: "Command-B" },
            exec: () => {
                switchTab(node.getModel(), "folder_view");
            },
        });
        commands.addCommand({
            name: "switch_serial_console",
            bindKey: { win: "Ctrl-`", mac: "Command-`" },
            exec: () => {
                switchTab(node.getModel(), "serial_console");
            },
        });
    }

    return (
        <>
            <Box sx={{ flexGrow: 1, height: "calc(" + height + "px - 38px)" }}>
                {fileIsLoaded && (
                    <AceEditor
                        ref={aceEditorRef}
                        mode={editorMode}
                        useSoftTabs={config.editor.use_soft_tabs}
                        wrapEnabled={true}
                        tabSize={config.editor.tab_size}
                        theme={themeName}
                        value={text}
                        height="100%"
                        width="100%"
                        onChange={onEditorChange}
                        onLoad={onEditorLoad}
                        fontSize={config.editor.font + "pt"}
                        setOptions={editorOptions}
                        readOnly={isReadOnly || false}
                        onCursorChange={onEditorCursorChange}
                    />
                )}
            </Box>
            <Box sx={{ flexGrow: 0, maxHeight: "35px" }}>
                <Divider />
                <Toolbar
                    variant="dense"
                    disableGutters={true}
                    sx={{ minHeight: "35px", maxHeight: "35px" }}
                >
                    <ToolbarEntry>Mode: {editorModeLabel}</ToolbarEntry>
                    <ToolbarEntry>State: {stateInfo}</ToolbarEntry>
                    <ToolbarEntry>{editorNewLineCharacter}</ToolbarEntry>
                    <ToolbarEntry>{tabInfo}</ToolbarEntry>
                    <ToolbarEntry fixedWidth={"200px"}>{selectionInfo}</ToolbarEntry>

                    <TooltipIconButton
                        id="editor-save"
                        title="Save and Run"
                        icon={SaveIcon}
                        onClick={() => saveFile(text)()}
                    />
                </Toolbar>
            </Box>
        </>
    );
}

Editor.propTypes = {
    fileHandle: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    isReadOnly: PropTypes.bool,
    isNewFile: PropTypes.bool,
    saveAndClose: PropTypes.object,
    setTabToClose: PropTypes.func,
};
