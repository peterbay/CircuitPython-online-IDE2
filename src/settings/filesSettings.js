const filesSettings = {
    extension: {
        py: {
            isBinary: false,
            canRun: true,
            class: 'file-code',
        },
        mpy: {
            isBinary: true,
            canRun: true,
            class: 'file-binary',
        },
        txt: {
            isBinary: false,
            canRun: false,
            class: 'file-text',
        },
        json: {
            isBinary: false,
            canRun: false,
            class: 'file-data',
        },
        toml: {
            isBinary: false,
            canRun: false,
            class: 'file-data',
        },
    },
    default: {
        isBinary: false,
        canRun: false,
        class: 'file-default',
    },
};

export default filesSettings;
