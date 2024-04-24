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
    Download as DownloadIcon,
} from "@mui/icons-material";

import {
    Box,
    Divider,
    Toolbar,
} from "@mui/material";

import MarkdownExtended from "./MarkdownExtended";
import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";
import { fileReadText, fileWriteText, fileDownload } from "../utils/fsUtils";
import IdeContext from "../contexts/IdeContext";
import { Actions as FlexLayoutActions } from "flexlayout-react";
import useEditorOptions from "../hooks/useEditorOptions";
import { useDebounce } from "use-debounce";
import { editorModes, defaultEditorMode } from '../settings/editorSettings';
import CodeExplorer from "./CodeExplorer";

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
    const [debouncedText] = useDebounce(text, 1000);
    const [fileIsLoaded, setFileIsLoaded] = useState(false);
    const [editorMode, setEditorMode] = useState("text");
    const [editorModeLabel, setEditorModeLabel] = useState("Text");
    const [stateInfo, setStateInfo] = useState("Saved");
    const [showPreview, setShowPreview] = useState(false);
    const [previewWidth, setPreviewWidth] = useState("0px");
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [previewButtonLabel, setPreviewButtonLabel] = useState("Preview");
    const [isInitialized, setIsInitialized] = useState(false);
    const height = node.getRect().height;
    const width = node.getRect().width;

    useEffect(() => {
        if (!fileHandle || isInitialized) {
            return;
        }
        const fileNameLower = fileHandle.name.toLowerCase();
        const extensionMatch = fileNameLower.match(/\.([^.]+)$/);
        const extension = extensionMatch ? extensionMatch[1] : "";
        const editorMode = editorModes[extension] || defaultEditorMode;
        setEditorMode(editorMode.mode);
        setEditorModeLabel(editorMode.label);
        if (editorMode.previewEnabled) {
            setPreviewEnabled(true);
            setShowPreview(width > 800 && editorMode.previewStateOnOpen);
            setPreviewWidth(editorMode.previewWidth);
            setPreviewButtonLabel(editorMode.previewButtonLabel);
        }
        setIsInitialized(true);
    }, [fileHandle, width, isInitialized]);

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

    useEffect(() => {
        if (editorApi.activeEditorNode === nodeId && editorApi.previewState !== null) {
            setShowPreview(editorApi.previewState);
            editorApi.setPreviewState(null);
        }

    }, [editorApi.activeEditorNode, editorApi.previewState, nodeId, editorApi]);

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

    function togglePreview() {
        setShowPreview(!showPreview);
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
        commands.addCommand({
            name: "code_explorer",
            bindKey: { win: "Ctrl-q", mac: "Ctrl-q" },
            exec: () => {
                togglePreview();
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
                    width: showPreview ? `calc(100% - ${previewWidth}) !important` : "100% !important",
                    maxWidth: showPreview ? `calc(100% - ${previewWidth}) !important` : "100% !important",
                    minWidth: showPreview ? `calc(100% - ${previewWidth}) !important` : "100% !important"
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
                            onCopy={(a) => { editorApi.addClipboardValue(a) }}
                        />
                    )}
                </Box>
                {previewEnabled && (
                    <Box
                        sx={{
                            height: "100%",
                            maxHeight: "100% !important",
                            width: previewWidth,
                            maxWidth: previewWidth,
                            minWidth: previewWidth,
                            overflow: "auto",
                            display: showPreview ? "block" : "none",
                        }}
                    >
                        {editorMode === "python" && (
                            <CodeExplorer
                                code={debouncedText}
                                goToLine={(line) => {
                                    const editor = aceEditorRef.current.editor;
                                    editor.gotoLine(line, 0, true);
                                    editor.focus();
                                }}
                                height={height - 38}
                                isActive={editorApi.activeEditorNode === nodeId}
                                togglePreview={togglePreview}
                            />
                        )}
                        {editorMode === "markdown" && showPreview && (
                            <MarkdownExtended>{text}</MarkdownExtended>
                        )}
                        {editorMode === "html" && showPreview && (
                            <div dangerouslySetInnerHTML={{ __html: text }} />
                        )}
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    flexGrow: 0,
                    maxHeight: "35px",
                }}>
                <Divider />
                <Toolbar
                    variant="dense"
                    disableGutters={true}
                    sx={{
                        minHeight: "35px",
                        maxHeight: "35px",
                    }}
                >
                    <TooltipIconButton
                        id="editor-save"
                        title="Save and Run (Ctrl + S)"
                        icon={SaveIcon}
                        onClick={() => saveFile(text)}
                    />
                    <TooltipIconButton
                        id="file-download"
                        title="Download"
                        icon={DownloadIcon}
                        onClick={() => fileDownload(fileHandle)}
                    />

                    <TooltipIconButton
                        id="editor-preview"
                        title={previewButtonLabel}
                        icon={PreviewIcon}
                        onClick={() => setShowPreview(!showPreview)}
                        disabled={!previewEnabled}
                    />

                    <ToolbarEntry>Mode: {editorModeLabel}</ToolbarEntry>
                    <ToolbarEntry>State: {stateInfo}</ToolbarEntry>
                    <ToolbarEntry>{editorNewLineCharacter}</ToolbarEntry>
                    <ToolbarEntry>{tabInfo}</ToolbarEntry>
                    <ToolbarEntry fixedWidth={"200px"}>{selectionInfo}</ToolbarEntry>
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
