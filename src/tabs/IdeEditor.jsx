/* eslint-disable react/prop-types */
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
import "ace-builds/src-noconflict/theme-dreamweaver";
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-iplastic";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-sqlserver";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-xcode";

// dark themes
import "ace-builds/src-noconflict/theme-ambiance";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/theme-cloud9_night_low_color";
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
import "ace-builds/src-noconflict/theme-tomorrow_night_blue";
import "ace-builds/src-noconflict/theme-tomorrow_night_bright";
import "ace-builds/src-noconflict/theme-tomorrow_night_eighties";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/theme-twilight";

// MUI
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

// Layout
import PopUp from "../layout/PopUp";
// file utils
import { getFileText, writeFileText } from "../react-local-file-system";
// context
import ideContext from "../ideContext";
// constant
import { FILE_EDITED, FILE_READ_ONLY } from "../constants";
// Flex layout
import * as FlexLayout from "flexlayout-react";

import { getThemeNameByLabel } from "../layout/themes.js";

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

export default function IdeEditor({ fileHandle, node, isReadOnly, isNewFile }) {
    const { config } = useContext(ideContext);
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
    const [theme, setTheme] = useState("");

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

    const height = node.getRect().height;
    const fileNameLower = fileHandle.name.toLowerCase();
    const extensionMatch = fileNameLower.match(/\.([^.]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : "";
    const editorMode = (editorModes[extension] || defaultEditorMode).mode;
    const editorModeLabel = (editorModes[extension] || defaultEditorMode).label;
    const stateInfo = isReadOnly ? "Read Only" : (fileEdited ? "Unsaved" : "Saved");

    useEffect(()=>{
        setConfigWordWrap(config.editor.wrap);
        if (isNewFile) {
            setConfigNewLine(config.editor.newline_mode);
        } else {
            setConfigNewLine("auto");
        }
    }, [config.editor.wrap, config.editor.newline_mode]);

    useEffect(()=>{
        setTheme(getThemeNameByLabel(config.global.theme));
    }, [config.global.theme]);

    useEffect(()=>{
        const line = (editorCursorInfo.row || 0) + 1;
        const column = (editorCursorInfo.column || 0) + 1;
        const selectedLength = editorSelectedLength ?
            "(" + editorSelectedLength.toString() + " selected)" : "";
        setSelectionInfo(`Ln ${line}, Col ${column} ${selectedLength}`);
    }, [editorCursorInfo, editorSelectedLength]);

    useEffect(()=>{
        const softTabs = (config.editor.use_soft_tabs === "spaces");
        const softTabsLabel = softTabs ? "Spaces" : "Tabs";
        const tabSize = config.editor.tab_size;
        setTabInfo(`${softTabsLabel}: ${tabSize}`);
    }, [config.editor.use_soft_tabs, config.editor.tab_size]);

    useEffect(() => {
        let namePrefix = "";
        if (isReadOnly) {
            namePrefix = `${FILE_READ_ONLY} `;
        } else if (fileEdited) {
            namePrefix = `${FILE_EDITED} `;
        }  

        const name = `${namePrefix}${fileHandle.name}`;

        node.getModel().doAction(FlexLayout.Actions.renameTab(node.getId(), name));

        let enableClose = true;
        if (config.editor.block_closing_unsaved_tab && fileEdited) {
            enableClose = false;
        }

        const action = FlexLayout.Actions.updateNodeAttributes(node.getId(), { enableClose });
        node.getModel().doAction(action);

    }, [isReadOnly, fileEdited, config.editor.block_closing_unsaved_tab]);

    useEffect(() => {
        async function loadText() {
            const fileText = (await getFileText(fileHandle));
            setText(fileText);
            setFileEdited(false);
        }
        loadText();
    }, [fileHandle]);

    function saveFile(text) {
        writeFileText(fileHandle, text);
        setFileEdited(false);
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
                console.log("word_wrap", configWordWrap);
                aceEditorRef.current.editor.session.setUseWrapMode(configWordWrap);
            },
        });
    }

    return (
        <PopUp title={fileHandle.name} parentStyle={{ height: height + "px" }}>
            <Box sx={{ flexGrow: 1, height: "calc(" + height + "px - 38px)" }}>
                <AceEditor
                    ref={aceEditorRef}
                    mode={editorMode}
                    useSoftTabs={config.editor.use_soft_tabs}
                    wrapEnabled={true}
                    tabSize={config.editor.tab_size}
                    theme={theme}
                    value={text}
                    height="100%"
                    width="100%"
                    onChange={(newValue) => {
                        setText(newValue);
                        setFileEdited(true);
                    }}
                    fontSize={config.editor.font + "pt"}
                    setOptions={{
                        cursorStyle: "shooth", // "ace"|"slim"|"smooth"|"wide"
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: config.editor.live_autocompletion,
                        enableSnippets: false,
                        highlightActiveLine: config.editor.highlight_active_line,
                        highlightSelectedWord: config.editor.highlight_selected_word,
                        hScrollBarAlwaysVisible: true,
                        newLineMode: configNewLine,
                        showInvisibles: config.editor.show_invisibles,
                        showLineNumbers: config.editor.show_line_numbers,
                        tabSize: config.editor.tab_size,
                        useSoftTabs: (config.editor.use_soft_tabs === "spaces"),
                        vScrollBarAlwaysVisible: true,
                        wrap: configWordWrap,
                    }}
                    readOnly={isReadOnly || false}
                    onCursorChange={(selection) => {
                        const session = aceEditorRef.current.editor.session;
                        setEditorCursorInfo(selection.getCursor());

                        const range = selection.getRange();
                        const textRange = session.getTextRange(range);
                        setEditorSelectedLength(textRange.length);

                        const newLineCharacter = session.doc.getNewLineCharacter();
                        setEditorNewLineCharacter(newLineCharacter === "\n" ? "LF" : "CRLF");
                    }}
                />
            </Box>
            <Box sx={{ flexGrow: 0, maxHeight: "35px" }}>
                <Divider />
                <Toolbar
                    variant="dense"
                    disableGutters={true}
                    sx={{ minHeight: "35px", maxHeight: "35px" }}
                >
                    <ToolbarEntry content={`Mode: ${editorModeLabel}`} />
                    <ToolbarEntry content={`State: ${stateInfo}`} />
                    <ToolbarEntry content={editorNewLineCharacter} />
                    <ToolbarEntry content={tabInfo} />
                    <ToolbarEntry content={selectionInfo} fixedWidth={"200px"} />
                    <Tooltip
                        key={"editor-save"}
                        id="editor-save"
                        title="Save and Run"
                    >
                        <IconButton
                            edge="start"
                            size="small"
                            style={{borderRadius: 0}}
                            onClick={() => {
                                saveFile(text);
                            }}
                        >
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </Box>
        </PopUp>
    );
}
