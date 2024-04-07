import { useState, useEffect } from 'react';

import {
    Actions as FlexLayoutActions,
    DockLocation as FlexLayoutDockLocation,
    TabNode as FlexLayoutTabNode,
} from 'flexlayout-react';

export default function useTabs({ flexModel, fsApi }) {

    const [tabsToClose, setTabsToClose] = useState([]);
    const [tabToClose, setTabToClose] = useState(null);
    const [cancelClosing, setCancelClosing] = useState(null);
    const [saveAndClose, setSaveAndClose] = useState(null);

    useEffect(() => {
        if (!tabToClose && tabsToClose.length) {
            setCancelClosing(false);
            setSaveAndClose(null);
            setTabToClose(tabsToClose[0]);
            setTabsToClose((prev) => prev.slice(1));
        }
    }, [tabsToClose, tabToClose]);

    useEffect(() => {
        if (cancelClosing) {
            setTabToClose(null);
            setTabsToClose([]);
        }
    }, [cancelClosing]);

    async function getTabNodes() {
        const nodes = [];
        await flexModel.visitNodes((node) => {
            if (node.getType() === 'tab') {
                nodes.push(node);
            }
        });
        return nodes;
    }

    async function getTabsByName (name, compareMethod) {
        const nodes = await getTabNodes();
        const tabs = nodes.filter((node) => {
            const tabName = node.getName();
            if (
                tabName &&
                ((compareMethod === 'equal' && tabName === name) || (compareMethod === 'startsWith' && tabName.startsWith(name)))
            ) {
                return true;
            }
        });
        return tabs;
    }

    async function tabShow(name) {
        const nodes = await getTabNodes();
        for (let tabNode of nodes) {
            if (tabNode.getComponent() === name && !tabNode.isVisible()) {
                flexModel.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
                return;
            }
        }
    }

    async function tabHide(name) {
        const nodes = await getTabNodes();
        for (let tabNode of nodes) {
            if (tabNode.getComponent() === name && tabNode.isVisible()) {
                flexModel.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
                return;
            }
        }
    }

    async function tabSwitch (name) {
        const nodes = await getTabNodes();
        for (let tabNode of nodes) {
            if (tabNode.getComponent() === name) {
                flexModel.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
                return;
            }
        }
    }

    async function getActiveEditorTab () {
        const tabset = await flexModel.getActiveTabset();
        if (!tabset || !tabset.getChildren) {
            return null;
        }
        const children = await tabset.getChildren();
        if (!children) {
            return null;
        }
        for (let child of children) {
            if (child.isVisible()) {
                const config = await child.getConfig();
                return {
                    config,
                    node: child,
                };
            }
        }
        return null;
    }

    async function tabsGetByFullPath (name, compareMethod) {
        const nodes = await getTabNodes();
        const tabs = nodes.filter((node) => {
            if (!node.getConfig) {
                return false;
            }
            const config = node.getConfig();
            if (
                config &&
                ((compareMethod === 'equal' && config.fullPath === name) ||
                    (compareMethod === 'startsWith' && config.fullPath.startsWith(name)))
            ) {
                return true;
            }
            return false;
        });
        return tabs;
    }

    async function tabOpen(name, component) {
        const tabNodes = await getTabsByName(name, 'equal');
        const tabNode = tabNodes && tabNodes.length > 0 ? tabNodes[0] : null;

        if (tabNode instanceof FlexLayoutTabNode) {
            // Activate the found tab
            flexModel.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
        } else {
            // Open a new tab
            flexModel.doAction(
                FlexLayoutActions.addNode(
                    {
                        type: 'tab',
                        name: name,
                        component: component,
                    },
                    flexModel.getActiveTabset() ? flexModel.getActiveTabset().getId() : 'left_tabset',
                    FlexLayoutDockLocation.CENTER,
                    -1
                )
            );
        }
    }

    async function tabOpenFile(fileHandle) {
        const fileName = fileHandle.name;
        const fullPath = fileHandle.fullPath;

        const tabNodes = await tabsGetByFullPath(fullPath, 'equal');
        const tabNode = tabNodes && tabNodes.length > 0 ? tabNodes[0] : null;

        if (tabNode instanceof FlexLayoutTabNode) {
            // Activate the found tab
            flexModel.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
        } else {
            // Open a new tab
            const activeTabset = flexModel.getActiveTabset();
            const node = flexModel.doAction(
                FlexLayoutActions.addNode(
                    {
                        type: 'tab',
                        name: fileName,
                        component: 'editor',
                        config: {
                            fileName: fileName,
                            fullPath: fullPath,
                        },
                    },
                    activeTabset ? activeTabset.getId() : 'left_tabset',
                    FlexLayoutDockLocation.CENTER,
                    -1
                )
            );
            fsApi.setFileLookUp((cur) => {
                return {
                    ...cur,
                    [fullPath]: {
                        fileHandle,
                        node,
                    },
                };
            });
        }
    }

    async function tabCloseFile(fileHandle) {
        const fullPath = fileHandle.fullPath;
        const tabNodes = await tabsGetByFullPath(fullPath, 'equal');
        for (let node of tabNodes) {
            if (node?.getClassName() === "unsaved") {
                setTabsToClose((prev) => {
                    return [...prev, node];
                })
                return;
            }
            fsApi.fileClosed(node);
            flexModel.doAction(FlexLayoutActions.deleteTab(node.getId()));
        }
    }

    async function tabCloseFiles(folderHandle) {
        const nodes = await getTabNodes();
        const path = `${folderHandle.fullPath}/`;

        for (let node of nodes) {
            const config = node.getConfig();
            if (!config?.fullPath?.startsWith(path)) {
                continue;
            }

            if (node?.getClassName() === "unsaved") {
                setTabsToClose((prev) => {
                    return [...prev, node];
                })
                return;
            }
            fsApi.fileClosed(node);
            flexModel.doAction(FlexLayoutActions.deleteTab(node.getId()));
        }
    }

    return {
        tabShow,
        tabHide,
        tabOpen,
        tabSwitch,
        getActiveEditorTab,
        tabsGetByFullPath,
        tabOpenFile,
        tabCloseFile,
        tabCloseFiles,
        tabsToClose,
        setTabsToClose,
        tabToClose,
        setTabToClose,
        cancelClosing,
        setCancelClosing,
        saveAndClose,
        setSaveAndClose,
    };
}
