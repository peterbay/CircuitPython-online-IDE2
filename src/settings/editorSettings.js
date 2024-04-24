const editorModes = {
    py: {
        mode: "python",
        label: "Python",
        previewEnabled: true,
        previewStateOnOpen: false,
        previewWidth: "400px",
        previewButtonLabel: "Code Explorer (Ctrl + Q)",
    },
    md: {
        mode: "markdown",
        label: "Markdown",
        previewEnabled: true,
        previewStateOnOpen: true,
        previewWidth: "50%",
        previewButtonLabel: "Markdown Preview (Ctrl + Q)",
    },
    json: {
        mode: "json",
        label: "JSON",
        previewEnabled: false,
        previewStateOnOpen: false,
        previewWidth: "0px",
        previewButtonLabel: null,
    },
    htm: {
        mode: "html",
        label: "HTML",
        previewEnabled: true,
        previewStateOnOpen: true,
        previewWidth: "50%",
        previewButtonLabel: "HTML Preview (Ctrl + Q)",
    },
    html: {
        mode: "html",
        label: "HTML",
        previewEnabled: true,
        previewStateOnOpen: true,
        previewWidth: "50%",
        previewButtonLabel: "HTML Preview (Ctrl + Q)",
    },
    toml: {
        mode: "toml",
        label: "TOML",
        previewEnabled: false,
        previewStateOnOpen: false,
        previewWidth: "0px",
        previewButtonLabel: null,
    },
};

const defaultEditorMode = {
    mode: "text",
    label: "Text",
    previewEnabled: false,
    previewStateOnOpen: false,
    previewWidth: "0px",
    previewButtonLabel: null,
};

export {
    editorModes,
    defaultEditorMode,
};
