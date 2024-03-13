import PropTypes from "prop-types";
import { useContext } from "react";
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
import CurFolderContext from "../contexts/CurFolderContext";
import DragContext from "../contexts/DragContext";
import { promptUniqueName, getDuplicateName } from "../utils/fsUiUtils";
import { isFolder, entryRename, entryCopy, entryRemove } from "../utils/fsUtils";
import filesSettings from "../settings/filesSettings";

export default function ContentEntry({ entryHandle, activeEditorInfo }) {
    const { currentFolderHandle, onFileClick, showFolderView, setIsLoading } = useContext(CurFolderContext);
    const { setEntryOnDrag, handleDrop } = useContext(DragContext);

    const isSelected = (activeEditorInfo && activeEditorInfo.fullPath === entryHandle.fullPath);
    const entryName = (entryHandle.isParent) ? ".." : entryHandle.name;
    const isDraggable = !entryHandle.isParent;
    const fileOptions = (entryHandle.extension && filesSettings.extension[entryHandle.extension]) || filesSettings.default;
    const isReadOnly = fileOptions.isBinary;

    const itemSize = 30;
    const iconSize = itemSize - 10;

    const iconSx = { width: `${iconSize}px`, height: `${iconSize}px` };
    let icon = <FileIcon sx={iconSx} />;
    if (entryHandle.isParent) {
        icon = <ReturnIcon sx={iconSx} />;

    } else if (isFolder(entryHandle)) {
        icon = <FolderIcon sx={iconSx} />;

    } else if (fileOptions.isBinary) {
        icon = <BinaryFileIcon sx={iconSx} />;

    }

    const className = fileOptions.class || "";

    // handler
    const items = [
        {
            name: "Rename",
            handler: async () => {
                const newName = await promptUniqueName(currentFolderHandle, "Rename from '" + entryHandle.name + "' to:", entryHandle.name);
                if (!newName) {
                    return;
                }
                setIsLoading(true);
                await entryRename(currentFolderHandle, entryHandle, newName);
                await showFolderView(currentFolderHandle);
                setIsLoading(false);
            },
        },
        {
            name: "Duplicate",
            handler: async () => {
                const cloneName = await getDuplicateName(currentFolderHandle, entryHandle);
                setIsLoading(true);
                await entryCopy(entryHandle, currentFolderHandle, cloneName);
                await showFolderView(currentFolderHandle);
                setIsLoading(false);
            },
        },
        {
            name: "Remove",
            handler: async () => {
                if (!confirm('Are you sure to remove "' + entryHandle.name + '"?\nThis is not revertible!')) {
                    return;
                }
                setIsLoading(true);
                await entryRemove(currentFolderHandle, entryHandle);
                await showFolderView(currentFolderHandle);
                setIsLoading(false);
            },
        },
    ];

    function onClickHandler() {
        if (isFolder(entryHandle)) {
            showFolderView(entryHandle);
        } else {
            onFileClick(entryHandle, isReadOnly);
        }
    }

    function onDragHandler() {
        setEntryOnDrag(entryHandle);
    }

    function onDropHandler() {
        handleDrop(entryHandle);
    }

    const entry = (
        <ListItem onContextMenu={(e)=> e.preventDefault()} disablePadding dense sx={{ height: `${itemSize}px` }}>
            <ListItemButton onClick={onClickHandler} selected={isSelected} sx={{ height: `${itemSize}px` }}>
                <ListItemIcon sx={{ minWidth: `${iconSize + 5}px` }} className={className}>{icon}</ListItemIcon>
                <ListItemText draggable={isDraggable} onDragStart={onDragHandler} primary={entryName} />
            </ListItemButton>
        </ListItem>
    );

    const entryContextMenu = (!entryHandle.isParent) ? <ApplyContextMenu items={items}>{entry}</ApplyContextMenu> : entry;

    return isFolder(entryHandle) ? <ApplyDrop onDropHandler={onDropHandler}>{entryContextMenu}</ApplyDrop> : entryContextMenu;
}

ContentEntry.propTypes = {
    entryHandle: PropTypes.object.isRequired,
    activeEditorInfo: PropTypes.object,
};
