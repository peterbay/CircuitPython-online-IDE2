import { useState, useEffect } from "react";

export default function useEditorOptions({ configApi, isNewFile }) {

    const [configNewLine, setConfigNewLine] = useState(false);
    const [editorOptions, setEditorOptions] = useState({});
    const [configWordWrap, setConfigWordWrap] = useState(false);

    useEffect(() => {
        setConfigWordWrap(configApi.config.editor.wrap);
    }, [configApi.config.editor.wrap]);

    useEffect(() => {
        if (isNewFile) {
            setConfigNewLine(configApi.config.editor.newline_mode);
        } else {
            setConfigNewLine("auto");
        }
    }, [isNewFile, configApi.config.editor.newline_mode]);

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
 
    return {
        editorOptions,
        configNewLine,
        configWordWrap,
        setConfigWordWrap,
    };
}
