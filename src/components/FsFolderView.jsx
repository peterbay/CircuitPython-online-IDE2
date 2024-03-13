import PropTypes from "prop-types";
import {
    useState,
    useEffect,
} from "react";

import {
    Backdrop,
    Breadcrumbs,
    CircularProgress,
    Divider,
    List,
    Toolbar,
    Typography,
} from "@mui/material";

import {
    CreateNewFolderOutlined as NewFolderIcon,
    NoteAddOutlined as NewFileIcon,
    RefreshOutlined as RefreshIcon,
} from "@mui/icons-material";

import TooltipIconButton from "./TooltipIconButton";
import ToolbarEntry from "./ToolbarEntry";

import ContentEntry from "./FsContentEntry";
import PathEntry from "./FsPathEntry";
import CurFolderContext from "../contexts/CurFolderContext";
import DragContext from "../contexts/DragContext";

import {
    isFolder,
    folderGetContent,
    entryExists,
    entryMove,
    folderCreate,
    fileCreate
} from "../utils/fsUtils";

import { promptUniqueName, getPathEntryLabel } from "../utils/fsUiUtils";

export default function FolderView({ rootFolder, onFileClick, activeEditorInfo }) {
    const [currentFolderHandle, setCurrentFolderHandle] = useState(rootFolder);
    const [entryOnDrag, setEntryOnDrag] = useState();
    const [path, setPath] = useState([rootFolder]);
    const [content, setContent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        async function showRoot() {
            setCurrentFolderHandle(rootFolder);
            setContent(await folderGetContent(rootFolder));
            setPath([rootFolder]);
        }
        showRoot();
    }, [rootFolder]);

    async function showFolderView(folderHandle) {
        // set context
        setCurrentFolderHandle(folderHandle);
        // set content
        setContent(await folderGetContent(folderHandle, true));
        // set path
        // if folderHandle in path, cut what ever behind it
        for (var i = 0; i < path.length; i++) {
            if (await folderHandle.isSameEntry(path[i])) {
                setPath((curPath) => {
                    return curPath.slice(0, i + 1);
                });
                return;
            }
        }
        // else, append folderHandle at the back
        setPath((curPath) => {
            return [...curPath, folderHandle];
        });
    }

    async function handleDrop(targetFolder) {
        if (await targetFolder.isSameEntry(entryOnDrag)) {
            return;
        }
        if (await targetFolder.isSameEntry(currentFolderHandle)) {
            return;
        }
        if (await entryExists(targetFolder, entryOnDrag.name)) {
            alert('"' + entryOnDrag.name + '" conflicts with another name in the target folder.');
            return;
        }
        setIsLoading(true);
        await entryMove(currentFolderHandle, entryOnDrag, targetFolder);
        await showFolderView(currentFolderHandle);
        setIsLoading(false);
    }

    const toolbarItems = [
        {
            name: "new_file",
            title: "New file",
            icon: NewFileIcon,
            handler: async () => {
                const newName = await promptUniqueName(currentFolderHandle, "New file name:", "");
                if (!newName) {
                    return;
                }
                setIsLoading(true);
                const newFileHandle = await fileCreate(currentFolderHandle, newName);
                await showFolderView(currentFolderHandle);
                setIsLoading(false);
                newFileHandle.fullPath = (currentFolderHandle.fullPath || "") + "/" + newFileHandle.name;
                onFileClick(newFileHandle, false, true);
            },
        },
        {
            name: "new_folder",
            title: "New folder",
            icon: NewFolderIcon,
            handler: async () => {
                const newName = await promptUniqueName(currentFolderHandle, "New folder name:", "");
                if (!newName) {
                    return;
                }
                setIsLoading(true);
                await folderCreate(currentFolderHandle, newName);
                await showFolderView(currentFolderHandle);
                setIsLoading(false);
            },
        },
        {
            name: "refresh",
            title: "Refresh",
            icon: RefreshIcon,
            handler: async () => {
                setIsLoading(true);
                await showFolderView(currentFolderHandle);
                setIsLoading(false);
            },
        },
    ];

    const foldersCount = content.filter((entry) => {
        return isFolder(entry) && !entry.isParent && !entry.name.startsWith(".");
    }).length;
    const filesCount = content.filter((entry) => !isFolder(entry)).length;

    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                maxHeight: "100%",
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CurFolderContext.Provider value={{
                currentFolderHandle,
                onFileClick,
                showFolderView,
                setIsLoading
            }}>
                <div
                    style={{
                        flexGrow: 0,
                    }}
                >
                    <DragContext.Provider value={{ setEntryOnDrag, handleDrop }}>
                        <Breadcrumbs aria-label="breadcrumb" separator="﹥">
                            {path.map((entry) => (
                                <PathEntry entryHandle={entry} key={"local_file_system_path_key_" + entry.name} />
                            ))}
                        </Breadcrumbs>
                    </DragContext.Provider>
                    <Divider />
                    <Toolbar variant="dense" disableGutters={true} sx={{ minHeight: "35px" }}>
                        <Typography component="div" noWrap={true} sx={{ flexGrow: 1, pl: 1, fontSize: "14px" }}>
                            {getPathEntryLabel(path[path.length - 1].name)}
                        </Typography>
                        {toolbarItems.map((item) => {
                            return (
                                <TooltipIconButton
                                    id={`fs-toolbar-item-${item.name}`}
                                    key={`fs-toolbar-item-${item.name}`}
                                    title={item.title}
                                    icon={item.icon}
                                    onClick={() => item.handler()}
                                />
                            );
                        })}
                    </Toolbar>
                    <Divider />
                </div>
                <div
                    style={{
                        flexGrow: 1,
                        overflow: "auto",
                    }}
                >
                    <DragContext.Provider value={{ setEntryOnDrag, handleDrop }}>
                        <List>
                            {content
                                .filter((entry) => {
                                    return !entry.name.startsWith(".");
                                })
                                .map((entry) => (
                                    <ContentEntry
                                        entryHandle={entry}
                                        key={"file_system_content_key_" + entry.name}
                                        activeEditorInfo={activeEditorInfo}
                                    />
                                ))}
                        </List>
                    </DragContext.Provider>
                </div>
                <div
                    style={{
                        flexGrow: 0,
                    }}
                >
                    <Divider />
                    <Toolbar variant="dense" disableGutters={true} sx={{ minHeight: "35px" }}>
                        <ToolbarEntry>{foldersCount} folders</ToolbarEntry>
                        <ToolbarEntry>{filesCount} files</ToolbarEntry>
                    </Toolbar>
                    <Divider />
                </div>
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </CurFolderContext.Provider>
        </div>
    );
}

FolderView.propTypes = {
    rootFolder: PropTypes.object.isRequired,
    onFileClick: PropTypes.func.isRequired,
    activeEditorInfo: PropTypes.object,
};
