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

export default function Editor({ fileHandle, node, isNewFile }) {
    const { fsApi, configApi, themeApi, tabsApi } = useContext(IdeContext);
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
    const [editorMode, setEditorMode] = useState("text");
    const [editorModeLabel, setEditorModeLabel] = useState("Text");
    const [stateInfo, setStateInfo] = useState("Saved");
    const height = node.getRect().height;

    useEffect(() => {
        if (!fileHandle) {
            return;
        }
        const fileNameLower = fileHandle.name.toLowerCase();
        const extensionMatch = fileNameLower.match(/\.([^.]+)$/);
        const extension = extensionMatch ? extensionMatch[1] : "";
        setEditorMode((editorModes[extension] || defaultEditorMode).mode);
        setEditorModeLabel((editorModes[extension] || defaultEditorMode).label);
        setStateInfo(fileHandle.isReadOnly ? "Read Only" : (fileEdited ? "Unsaved" : "Saved"));

    }, [fileHandle, fileEdited]);

    useEffect(() => {
        if (tabsApi.saveAndClose && tabsApi.saveAndClose.getId() === node.getId()) {
            fileWriteText(fileHandle, text);
            fsApi.fileClosed(node);
            node.getModel().doAction(FlexLayoutActions.deleteTab(node.getId()));
            tabsApi.setTabToClose(null);
        }
    }, [node, fileHandle, text, fsApi, tabsApi]);

    useEffect(() => {
        setConfigWordWrap(configApi.config.editor.wrap);
        if (isNewFile) {
            setConfigNewLine(configApi.config.editor.newline_mode);
        } else {
            setConfigNewLine("auto");
        }
    }, [isNewFile, configApi.config.editor.wrap, configApi.config.editor.newline_mode]);

    useEffect(() => {
        const line = (editorCursorInfo.row || 0) + 1;
        const column = (editorCursorInfo.column || 0) + 1;
        const selectedLength = editorSelectedLength ?
            "(" + editorSelectedLength.toString() + " selected)" : "";
        setSelectionInfo(`Ln ${line}, Col ${column} ${selectedLength}`);
    }, [editorCursorInfo, editorSelectedLength]);

    useEffect(() => {
        const softTabsLabel = (configApi.config.editor.use_soft_tabs === "spaces") ? "Spaces" : "Tabs";
        const tabSize = configApi.config.editor.tab_size;
        setTabInfo(`${softTabsLabel}: ${tabSize}`);
    }, [configApi.config.editor.use_soft_tabs, configApi.config.editor.tab_size]);

    useEffect(() => {
        let namePrefix = "";
        if (fileHandle.isReadOnly) {
            namePrefix = `🔒 `;
        } else if (fileEdited) {
            namePrefix = `✏️ `;
        }

        const name = `${namePrefix}${fileHandle.name}`;
        const model = node.getModel();
        const nodeId = node.getId();

        fileHandle.unsaved = fileEdited;

        model.doAction(FlexLayoutActions.renameTab(nodeId, name));

        const action = FlexLayoutActions.updateNodeAttributes(nodeId, {
            className: fileEdited ? "unsaved" : "",
        });

        model.doAction(action);

    }, [node, fileHandle, fileEdited, fileHandle.name]);

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
            enableLiveAutocompletion: configApi.config.editor.live_autocompletion,
            enableSnippets: false,
            highlightActiveLine: configApi.config.editor.highlight_active_line,
            highlightSelectedWord: configApi.config.editor.highlight_selected_word,
            hScrollBarAlwaysVisible: true,
            newLineMode: configNewLine,
            printMarginColumn: configApi.config.editor.print_margin_column,
            showInvisibles: configApi.config.editor.show_invisibles,
            showLineNumbers: configApi.config.editor.show_line_numbers,
            showPrintMargin: configApi.config.editor.show_print_margin,
            tabSize: configApi.config.editor.tab_size,
            useSoftTabs: (configApi.config.editor.use_soft_tabs === "spaces"),
            vScrollBarAlwaysVisible: true,
            wrap: configWordWrap,
        });
    }, [configApi.config.editor, configWordWrap, configNewLine]);

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
                tabsApi.tabSwitch("folder_view");
            },
        });
        commands.addCommand({
            name: "switch_serial_console",
            bindKey: { win: "Ctrl-`", mac: "Command-`" },
            exec: () => {
                tabsApi.tabSwitch("serial_console");
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
                        useSoftTabs={configApi.config.editor.use_soft_tabs}
                        wrapEnabled={true}
                        tabSize={configApi.config.editor.tab_size}
                        theme={themeApi.themeName}
                        value={text}
                        height="100%"
                        width="100%"
                        onChange={onEditorChange}
                        onLoad={onEditorLoad}
                        fontSize={configApi.config.editor.font + "pt"}
                        setOptions={editorOptions}
                        readOnly={fileHandle.isReadOnly || false}
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
    isNewFile: PropTypes.bool,
};
