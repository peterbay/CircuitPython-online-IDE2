const configEditor = {
    title: 'Editor',
    description: 'Code editor settings.',
    type: 'object',
    properties: {
        font: {
            title: 'Text font size',
            type: 'number',
            default: 12,
        },
        newline_mode: {
            title: 'Newline mode - for new files',
            type: 'string',
            enum: ['auto', 'unix', 'windows'],
            default: 'auto',
        },
        use_soft_tabs: {
            title: 'Select indentation type',
            type: 'string',
            enum: ['tabs', 'spaces'],
            default: 'tabs',
        },
        tab_size: {
            title: 'Tab size',
            type: 'number',
            minimum: 1,
            maximum: 8,
            default: 4,
        },
        highlight_active_line: {
            description: 'Active line',
            title: 'Highlight the active line',
            type: 'boolean',
            default: true,
        },
        highlight_selected_word: {
            description: 'Highlight selected word',
            title: 'Highlight all occurrences of the selected word.',
            type: 'boolean',
            default: true,
        },
        show_invisibles: {
            description: 'Invisible characters',
            title: 'Show invisible characters (tabs, spaces, newlines)',
            type: 'boolean',
            default: false,
        },
        live_autocompletion: {
            description: 'Live autocompletion',
            title: 'Enable live autocompletion. When disabled, use [Ctrl-Space] for autocompletion.',
            type: 'boolean',
            default: false,
        },
        show_line_numbers: {
            description: 'Line numbers',
            title: 'Show line numbers',
            type: 'boolean',
            default: true,
        },
        wrap: {
            description: 'Word wrap',
            title: 'Enable wrap behaviours',
            type: 'boolean',
            default: true,
        },
        show_print_margin: {
            description: 'Print margin',
            title: 'Show print margin',
            type: 'boolean',
            default: true,
        },
        print_margin_column: {
            title: 'Print margin column',
            type: 'number',
            default: 80,
            minimum: 1,
            maximum: 200,
        },
    },
};

export default configEditor;
