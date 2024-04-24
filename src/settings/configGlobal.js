const configGlobal = {
    title: 'Global',
    type: 'object',
    properties: {
        theme: {
            title: 'Global theme',
            description: "Choose 'system' to follow OS theme settings",
            type: 'string',
            enum: [],
            default: '',
        },
    },
};

export default configGlobal;
