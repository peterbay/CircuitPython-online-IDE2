import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    DescriptionOutlined as FileIcon,
    FolderOutlined as FolderIcon,
    InsertDriveFileOutlined as BinaryFileIcon,
    KeyboardReturnOutlined as ReturnIcon,
} from "@mui/icons-material";
import ApplyContextMenu from "./ApplyContextMenu";
import ApplyDrop from "./ApplyDrop";
import IdeContext from "../contexts/IdeContext";
import DragContext from "../contexts/DragContext";

import find from "lodash/find";
import { fileDownload } from "../utils/fsUtils";

export default function FsContentEntry({ entryHandle }) {

    const { fsApi, tabsApi } = useContext(IdeContext);
    const { setEntryOnDrag, handleDrop } = useContext(DragContext);

    const [isOpened, setIsOpened] = useState(false);
    const [hasOpenedFiles, setHasOpenedFiles] = useState(false);
    const [entryStatusClassName, setEntryStatusClassName] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const [entryName] = useState((entryHandle.isParent) ? ".." : entryHandle.name);
    const [isDraggable, setIsDraggable] = useState(!entryHandle.isParent && !isOpened);

    const itemSize = 30;
    const iconSize = itemSize - 10;

    const iconSx = { width: `${iconSize}px`, height: `${iconSize}px` };
    let icon = <FileIcon sx={iconSx} />;
    if (entryHandle.isParent) {
        icon = <ReturnIcon sx={iconSx} />;

    } else if (entryHandle.isFolder) {
        icon = <FolderIcon sx={iconSx} />;

    } else if (entryHandle.isBinary) {
        icon = <BinaryFileIcon sx={iconSx} />;

    }

    const fileClassName = entryHandle.class || "";

    useEffect(() => {
        setIsDraggable(!entryHandle.isParent && !isOpened && !hasOpenedFiles);
    }, [entryHandle.isParent, isOpened, hasOpenedFiles]);

    useEffect(() => {
        if (entryHandle.isParent || entryHandle.isFolder) {
            return;
        }
        setIsSelected(fsApi.activeFileFullPath === entryHandle.fullPath);
    }, [fsApi.activeFileFullPath, entryHandle.fullPath, entryHandle.isParent, entryHandle.isFolder]);

    useEffect(() => {
        if (entryHandle.unsaved) {
            setEntryStatusClassName("file-unsaved");
        } else if (isOpened) {
            setEntryStatusClassName("file-opened");
        } else if (hasOpenedFiles) {
            setEntryStatusClassName("folder-has-opened-files");
        } else {
            setEntryStatusClassName("fs-entry");
        }
    }, [entryHandle.unsaved, isOpened, hasOpenedFiles]);

    const items = [
        {
            name: "Download File",
            handler: async () => {
                fileDownload(entryHandle);
            },
            show: (!entryHandle.isParent && !entryHandle.isFolder),
            disabled: false,
        },
        {
            name: "Close File",
            handler: async () => {
                tabsApi.tabCloseFile(entryHandle);
            },
            show: (!entryHandle.isParent && !entryHandle.isFolder),
            disabled: !isOpened,
        },
        {
            name: "Close Opened Files",
            handler: async () => {
                tabsApi.tabCloseFiles(entryHandle);
            },
            show: (entryHandle.isFolder && hasOpenedFiles),
            disabled: false,
        },
        {
            name: entryHandle.isFolder ? "Rename Folder" : "Rename File",
            handler: async () => {
                fsApi.setFsAction({
                    action: "rename",
                    entryHandle,
                });
            },
            show: (!entryHandle.isParent),
            disabled: (isOpened || hasOpenedFiles),
        },
        {
            name: entryHandle.isFolder ? "Duplicate Folder" : "Duplicate File",
            handler: async () => {
                fsApi.setFsAction({
                    action: "duplicate",
                    entryHandle,
                });
            },
            show: (!entryHandle.isParent),
            disabled: false,
        },
        {
            name: entryHandle.isFolder ? "Delete Folder" : "Delete File",
            handler: async () => {
                fsApi.setFsAction({
                    action: "delete",
                    entryHandle,
                });
            },
            show: (!entryHandle.isParent),
            disabled: (isOpened || hasOpenedFiles),
        },
    ];

    useEffect(() => {
        if (entryHandle.isFolder || entryHandle.isParent && fsApi.fileLookUp) {
            const path = `${entryHandle.fullPath}/`;
            const status = find(fsApi.fileLookUp, (value, key) => key.startsWith(path));
            setHasOpenedFiles(!!status);
        }
    }, [fsApi.fileLookUp, entryHandle]);

    useEffect(() => {
        if (entryHandle.isFolder || entryHandle.isParent) {
            return;
        }
        setIsOpened(fsApi.fileLookUp && fsApi.fileLookUp[entryHandle.fullPath]);
    }, [fsApi.fileLookUp, entryHandle]);

    function onClickHandler() {
        if (entryHandle.isParent || entryHandle.isFolder) {
            fsApi.folderOpen(entryHandle);
        } else {
            tabsApi.tabOpenFile(entryHandle);
        }
    }

    function onDragHandler() {
        setEntryOnDrag(entryHandle);
    }

    function onDropHandler() {
        handleDrop(entryHandle);
    }

    const entry = (
        <ListItem
            onContextMenu={(e) => e.preventDefault()}
            disablePadding
            dense
            sx={{
                height: `${itemSize}px`,
            }}
            className={entryStatusClassName}
        >
            <ListItemButton
                onClick={onClickHandler}
                selected={isSelected}
                sx={{
                    height: `${itemSize}px`,
                    padding: "0 5px",
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: `${iconSize + 5}px`,
                    }}
                    className={fileClassName}
                >{icon}</ListItemIcon>
                <ListItemText
                    draggable={isDraggable}
                    onDragStart={onDragHandler}
                    primary={entryName}
                    primaryTypographyProps={{
                        style: {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "20px",
                            fontWeight: "400",
                        },
                    }}
                />
            </ListItemButton>
        </ListItem>
    );

    let entryContextMenu = null;

    if (entryHandle.isParent) {
        entryContextMenu = entry;

    } else {
        entryContextMenu = <ApplyContextMenu items={items}>{entry}</ApplyContextMenu>

    }

    if (entryHandle.isFolder || entryHandle.isParent) {
        return <ApplyDrop onDropHandler={onDropHandler}>{entryContextMenu}</ApplyDrop>;
    }

    return entryContextMenu;

}

FsContentEntry.propTypes = {
    entryHandle: PropTypes.object.isRequired,
};
