import {
    useState,
    useContext,
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

import IdeContext from "../contexts/IdeContext";
import TooltipIconButton from "./TooltipIconButton";
import ToolbarEntry from "./ToolbarEntry";


import FsContentEntry from "./FsContentEntry";
import FsPathEntry from "./FsPathEntry";
import DragContext from "../contexts/DragContext";

import {
    entryExists,
    entryMove,
} from "../utils/fsUtils";

export default function FsFolderView() {

    const { fsApi } = useContext(IdeContext);

    const [entryOnDrag, setEntryOnDrag] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [path, setPath] = useState([]);

    useEffect(() => {
        if (fsApi.path && fsApi.path.length > 0) {
            setPath(fsApi.path);
        }
    }, [fsApi.path]);

    async function handleDrop(targetFolder) {
        if (await targetFolder.isSameEntry(entryOnDrag)) {
            return;
        }
        if (await targetFolder.isSameEntry(fsApi.currentFolderHandle)) {
            return;
        }
        if (await entryExists(targetFolder, entryOnDrag.name)) {
            alert('"' + entryOnDrag.name + '" conflicts with another name in the target folder.');
            return;
        }
        setIsLoading(true);
        await entryMove(entryOnDrag, targetFolder);
        await fsApi.folderOpen(fsApi.currentFolderHandle);
        setIsLoading(false);
    }

    const toolbarItems = [
        {
            name: "new_file",
            title: "New file",
            icon: NewFileIcon,
            handler: async () => {
                fsApi.setFsAction({
                    action: "new_file",
                    parentEntryHandle: fsApi.currentFolderHandle,
                });
            },
        },
        {
            name: "new_folder",
            title: "New folder",
            icon: NewFolderIcon,
            handler: async () => {
                fsApi.setFsAction({
                    action: "new_folder",
                    parentEntryHandle: fsApi.currentFolderHandle,
                });
            },
        },
        {
            name: "refresh",
            title: "Refresh",
            icon: RefreshIcon,
            handler: async () => {
                setIsLoading(true);
                await fsApi.folderOpen(fsApi.currentFolderHandle);
                setIsLoading(false);
            },
        },
    ];

    const foldersCount = fsApi.folderContent.filter((entry) => {
        return entry.isFolder && !entry.isParent && !entry.name.startsWith(".");
    }).length;
    const filesCount = fsApi.folderContent.filter((entry) => !entry.isFolder).length;

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
            <div
                style={{
                    flexGrow: 0,
                }}
            >
                <DragContext.Provider value={{ setEntryOnDrag, handleDrop }}>
                    <Breadcrumbs aria-label="breadcrumb" separator="﹥">
                        {path.map((entry) => (
                            <FsPathEntry entryHandle={entry} key={"local_file_system_path_key_" + entry.name} />
                        ))}
                    </Breadcrumbs>
                </DragContext.Provider>
                <Divider />
                <Toolbar variant="dense" disableGutters={true} sx={{ minHeight: "35px" }}>
                    <Typography component="div" noWrap={true} sx={{ flexGrow: 1, pl: 1, fontSize: "14px" }}>
                        {path[path.length - 1]?.label}
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
                        {fsApi.folderContent
                            .filter((entry) => {
                                return !entry.name.startsWith(".");
                            })
                            .map((entry) => (
                                <FsContentEntry
                                    entryHandle={entry}
                                    key={"file_system_content_key_" + entry.name}
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
        </div>
    );
}
