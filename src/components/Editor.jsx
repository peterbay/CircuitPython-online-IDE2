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
    Preview as PreviewIcon,
} from "@mui/icons-material";

import {
    Box,
    Divider,
    Toolbar,
} from "@mui/material";

import MarkdownExtended from "./MarkdownExtended";
import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";
import { fileReadText, fileWriteText } from "../utils/fsUtils";
import IdeContext from "../contexts/IdeContext";
import { Actions as FlexLayoutActions } from "flexlayout-react";
import useEditorOptions from "../hooks/useEditorOptions";

const editorModes = {
    py: {
        mode: "python",
        label: "Python",
        enablePreview: false,
    },
    md: {
        mode: "markdown",
        label: "Markdown",
        enablePreview: true,
    },
    json: {
        mode: "json",
        label: "JSON",
        enablePreview: false,
    },
    htm: {
        mode: "html",
        label: "HTML",
        enablePreview: true,
    },
    html: {
        mode: "html",
        label: "HTML",
        enablePreview: true,
    },
    toml: {
        mode: "toml",
        label: "TOML",
        enablePreview: false,
    },
};

const defaultEditorMode = {
    mode: "text",
    label: "Text",
    enablePreview: false,
};

export default function Editor({ fileHandle, node, isNewFile }) {
    const { fsApi, configApi, themeApi, tabsApi, editorApi, paletteApi } = useContext(IdeContext);
    const editorOptions = useEditorOptions({ configApi, isNewFile });

    const aceEditorRef = useRef(null);

    const [nodeId,] = useState(node.getId());
    const [nodeModel,] = useState(node.getModel());
    const [editorCursorInfo, setEditorCursorInfo] = useState(false);
    const [editorNewLineCharacter, setEditorNewLineCharacter] = useState(false);
    const [editorSelectedLength, setEditorSelectedLength] = useState(false);
    const [fileEdited, setFileEdited] = useState(false);
    const [selectionInfo, setSelectionInfo] = useState(false);
    const [tabInfo, setTabInfo] = useState(false);
    const [text, setText] = useState("");
    const [fileIsLoaded, setFileIsLoaded] = useState(false);
    const [editorMode, setEditorMode] = useState("text");
    const [editorModeLabel, setEditorModeLabel] = useState("Text");
    const [stateInfo, setStateInfo] = useState("Saved");
    const [showPreview, setShowPreview] = useState(false);
    const [enablePreview, setEnablePreview] = useState(false);
    const height = node.getRect().height;

    useEffect(() => {
        if (!fileHandle) {
            return;
        }
        const fileNameLower = fileHandle.name.toLowerCase();
        const extensionMatch = fileNameLower.match(/\.([^.]+)$/);
        const extension = extensionMatch ? extensionMatch[1] : "";
        const editorMode = editorModes[extension] || defaultEditorMode;
        setEditorMode(editorMode.mode);
        setEditorModeLabel(editorMode.label);
        if (editorMode.enablePreview) {
            setEnablePreview(true);
            setShowPreview(true);
        }
    }, [fileHandle]);

    useEffect(() => {
        if (!fileHandle) {
            return;
        }
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
        fileHandle.unsaved = fileEdited;

        nodeModel.doAction(FlexLayoutActions.renameTab(nodeId, name));

        const action = FlexLayoutActions.updateNodeAttributes(nodeId, {
            className: fileEdited ? "unsaved" : "",
        });

        nodeModel.doAction(action);

    }, [nodeId, nodeModel, fileHandle, fileEdited, fileHandle.name]);

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
        if (editorApi.activeEditorNode === nodeId && editorApi.editorAction) {
            const editor = aceEditorRef?.current?.editor;

            if (editor) {
                editorApi.applyTransform(editor, editorApi.editorAction);
            }

            editorApi.setEditorAction(null);
        }

    }, [editorApi.activeEditorNode, editorApi.editorAction, nodeId, aceEditorRef, editorApi]);


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
                editorOptions.setConfigWordWrap(!editorOptions.configWordWrap);
                aceEditorRef.current.editor.session.setUseWrapMode(editorOptions.configWordWrap);
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
        commands.addCommand({
            name: "command_palette",
            bindKey: { win: "Ctrl-Shift-q", mac: "Ctrl-Shift-q" },
            exec: () => {
                paletteApi.setOpen(true);
            },
        });
    }

    return (
        <>
            <Box sx={{
                flexGrow: 1,
                flexDirection: 'row',
                display: 'flex',
                height: "calc(" + height + "px - 38px)"
            }}>
                <Box sx={{
                    height: "100%",
                    width: showPreview ? "50% !important" : "100% !important",
                    maxWidth: showPreview ? "50% !important" : "100% !important",
                    minWidth: showPreview ? "50% !important" : "100% !important"
                }}>
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
                            setOptions={editorOptions.editorOptions}
                            readOnly={fileHandle.isReadOnly || false}
                            onCursorChange={onEditorCursorChange}
                        />
                    )}
                </Box>
                {enablePreview && showPreview && (
                    <Box
                        sx={{
                            height: "calc(" + height + "px - 38px)",
                            maxHeight: "calc(" + height + "px - 38px)",
                            width: showPreview ? "50% !important" : "100% !important",
                            maxWidth: showPreview ? "50% !important" : "100% !important",
                            minWidth: showPreview ? "50% !important" : "100% !important",
                            overflow: "auto"
                        }}
                    >
                        {editorMode === "markdown" && (
                            <MarkdownExtended>{text}</MarkdownExtended>
                        )}
                        {editorMode === "html" && (
                            <div dangerouslySetInnerHTML={{ __html: text }} />
                        )}
                    </Box>
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
                        title="Preview"
                        icon={PreviewIcon}
                        onClick={() => setShowPreview(!showPreview)}
                    />

                    <TooltipIconButton
                        id="editor-save"
                        title="Save and Run"
                        icon={SaveIcon}
                        onClick={() => saveFile(text)}
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
