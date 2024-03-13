const layout = {
    global: {
        tabEnableClose: true,
        tabEnableFloat: false,
        tabEnableRename: false,
    },
    borders: [
        {
            type: 'border',
            location: 'left',
            size: 300,
            selected: 0,
            children: [
                {
                    type: 'tab',
                    name: 'Folder View',
                    component: 'folder_view',
                    enableClose: false,
                    enableDrag: false,
                },
            ],
        },
        {
            type: 'border',
            location: 'right',
            size: 300,
            children: [
                {
                    type: 'tab',
                    name: 'Settings',
                    component: 'settings',
                    enableClose: false,
                },
            ],
        },
        {
            type: 'border',
            location: 'bottom',
            size: 300,
            selected: 0,
            children: [
                {
                    type: 'tab',
                    name: 'Serial Console',
                    component: 'serial_console',
                    enableClose: false,
                },
            ],
        },
    ],
    layout: {
        type: 'row',
        id: 'root',
        weight: 100,
        children: [
            {
                type: 'tabset',
                id: 'left_tabset',
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: 'tab',
                        name: 'Navigation',
                        component: 'navigation',
                        enableClose: true,
                    },
                    {
                        type: 'tab',
                        name: 'Dashboard',
                        component: 'dashboard',
                        enableClose: true,
                    },
                ],
            },
        ],
    },
};

export default layout;
