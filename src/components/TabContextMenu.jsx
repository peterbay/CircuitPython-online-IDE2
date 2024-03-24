import PropTypes from "prop-types";
import { useState, useEffect, useContext } from "react";
import {
    Menu,
    MenuItem,
} from "@mui/material";

import { Actions as FlexLayoutActions } from 'flexlayout-react';

import IdeContext from "../contexts/IdeContext";

import findIndex from "lodash/findIndex";

export default function TabContextMenu({ tabContextMenu }) {

    const { flexModel, fsApi, tabsApi } = useContext(IdeContext);

    const [contextMenu, setContextMenu] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const closeFilteredTabs = async function (filter) {
        if (!selectedNode) {
            return;
        }
        const nodeId = selectedNode.getId();
        const parent = selectedNode.getParent();

        if (parent?.getChildren) {
            const children = parent.getChildren().filter((child) => child?.getConfig()?.fullPath);
            const position = findIndex(children, (child) => child.getId() === nodeId);
            let nodes = [];

            if (filter === "all") {
                nodes = children;

            } else if (filter === "left" && position > 0) {
                nodes = children.slice(0, position);

            } else if (filter === "right" && position < children.length - 1) {
                nodes = children.slice(position + 1);

            } else if (filter === "actual") {
                nodes = [selectedNode];

            } else if (filter === "saved") {
                nodes = children.filter((child) => child.getClassName() !== "unsaved");

            } else if (filter === "others") {
                nodes = children.filter((child) => child.getId() !== nodeId);

            }

            if (nodes.length) {
                const unsavedNodes = nodes.filter((node) => node.getClassName() === "unsaved");
                const savedNodes = nodes.filter((node) => node.getClassName() !== "unsaved");

                while (savedNodes.length) {
                    const node = savedNodes.pop();
                    if (node.isEnableClose()) {
                        await fsApi.fileClosed(node);
                        flexModel.doAction(FlexLayoutActions.deleteTab(node.getId()));
                    }
                }

                if (unsavedNodes.length) {
                    tabsApi.setTabsToClose((prev) => {
                        return [...prev, ...nodes];
                    });
                }
            }
        }
    };

    const menuItems = [
        {
            name: "Close",
            handler: () => closeFilteredTabs("actual"),
        },
        {
            name: "Close Others",
            handler: () => closeFilteredTabs("others"),
        },
        {
            name: "Close to the Left",
            handler: () => closeFilteredTabs("left"),
        },
        {
            name: "Close to the Right",
            handler: () => closeFilteredTabs("right"),
        },
        {
            name: "Close Saved",
            handler: () => closeFilteredTabs("saved"),
        },
        {
            name: "Close All",
            handler: () => closeFilteredTabs("all"),
        }
    ];

    useEffect(() => {
        if (!tabContextMenu) {
            return;
        }
        setSelectedNode(tabContextMenu.node);
        setContextMenu({
            mouseX: tabContextMenu.event.clientX,
            mouseY: tabContextMenu.event.clientY,
        });
    }, [tabContextMenu]);

    const handleClose = () => {
        setContextMenu(null);
        setSelectedNode(null);
    };

    return (
        <>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
            >
                {menuItems.map((item) => {
                    return (
                        <MenuItem key={"tab_menu_item_key_" + item.name}
                            onClick={(event) => {
                                handleClose();
                                item.handler(event);
                            }}
                            dense={true}
                        >
                            {item.name}
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}

TabContextMenu.propTypes = {
    model: PropTypes.object,
    tabContextMenu: PropTypes.object,
};
