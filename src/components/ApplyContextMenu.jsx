import PropTypes from "prop-types";
import { useState, useContext } from "react";
import {
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";

import IdeContext from "../contexts/IdeContext";
export default function ApplyContextMenu({ children, items }) {

    const { themeApi } = useContext(IdeContext);
    const [contextMenu, setContextMenu] = useState(null);

    const handleContextMenu = (event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX,
                    mouseY: event.clientY,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                // Other native context menus might behave different.
                // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    return (
        <>
            <div onContextMenu={handleContextMenu} style={{ cursor: "context-menu" }}>
                {children}
                <Menu
                    open={contextMenu !== null}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                    }
                    MenuListProps={{
                        style: {
                            padding: '4px',
                        },
                        sx: {
                            '& li': {
                                color: themeApi.isDarkMode ? '#ccc' : '#888',
                            },
                            '& li:hover': {
                                backgroundColor: themeApi.isDarkMode ? 'rgb(26, 56, 95)' : 'rgb(65, 117, 212)',
                                color: 'white !important',
                            }
                        },
                    }}
                    slotProps={{
                        style: {
                            padding: '5px',
                        },
                    }}
                >
                    {items.filter((item) => item.show)
                        .map((item) => {
                            return (
                                <Tooltip
                                    key={`fs_item_key_${item.name}`}
                                    id={`fs_item_id_${item.name}`}
                                    title={item.tooltip}
                                    placement="right-start"
                                >
                                    <MenuItem
                                        key={"local_file_system_menu_item_key_" + item.name}
                                        onClick={(event) => {
                                            handleClose();
                                            item.handler(event);
                                        }}
                                        dense={true}
                                        disabled={!!item.disabled}
                                    >
                                        {item.name}
                                    </MenuItem>
                                </Tooltip>

                            );
                        })}
                </Menu>
            </div>
        </>
    );
}

ApplyContextMenu.propTypes = {
    children: PropTypes.object,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            handler: PropTypes.func,
        })
    ),
};
