import { Actions as FlexLayoutActions } from "flexlayout-react";

const appendNodes = (nodes, node) => {
    nodes.push(node);
    if (node.getChildren) {
        for (let child of node.getChildren()) {
            appendNodes(nodes, child);
        }
    }
    return nodes;
};

const getListOfAllNodes = (model, location) => {
    const nodes = [];
    if (location === "root" || location === "all") {
        appendNodes(nodes, model.getRoot());
    }
    if (location === "borders" || location === "all") {
        const borders = model.getBorderSet().getBorders();
        if (borders) {
            for (let border of borders) {
                appendNodes(nodes, border);
            }
        }
    }
    return nodes;
};

const getTabsByPath = (model, location, name, compareMethod) => {
    const nodes = getListOfAllNodes(model, location);
    const tabs = nodes.filter((node) => {
        if (node.getType() === "tab" && node.getConfig) {
            const config = node.getConfig();
            if (config && (
                (compareMethod === "equal" && config.fullPath === name) ||
                (compareMethod === "startsWith" && config.fullPath.startsWith(name))
            )) {
                return true;
            }
        }
        return false;
    });
    return tabs;
};

const getTabsByName = (model, location, name, compareMethod) => {
    const nodes = getListOfAllNodes(model, location);
    const tabs = nodes.filter((node) => {
        if (node.getType() === "tab") {
            const tabName = node.getName();
            if (tabName && (
                (compareMethod === "equal" && tabName === name) ||
                (compareMethod === "startsWith" && tabName.startsWith(name))
            )) {
                return true;
            }
        }
        return false;
    });
    return tabs;
};

const getActiveEditorTabConfig = async (model) => {
    const tabset = await model.getActiveTabset();
    if (!tabset || !tabset.getChildren) {
        return null;
    }
    const children = await tabset.getChildren();
    if (children) {
        for (let child of children) {
            if (child.isVisible()) {
                return await child.getConfig();
            }
        }
    }
    return null;
};

const activateTab = (model, name) => {
    const nodes = getListOfAllNodes(model, "all");
    if (!nodes || !nodes.length) {
        return;
    }
    for (let tabNode of nodes) {
        if (tabNode.getType() === "tab" &&
            tabNode.getComponent() === name &&
            !tabNode.isVisible()
        ) {
            model.doAction(FlexLayoutActions.selectTab(tabNode.getId()));
            return;
        }
    }
};

export {
    activateTab,
    appendNodes,
    getListOfAllNodes,
    getTabsByPath,
    getTabsByName,
    getActiveEditorTabConfig,
};
