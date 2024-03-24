import { useState, useEffect } from 'react';
import { isEntryHealthy } from '../utils/fsUtils';

import { folderGetContent } from '../utils/fsUtils';

export default function useFileSystem() {
    const [directoryReady, setDirectoryReady] = useState(false);
    const [directoryStatus, setDirectoryStatus] = useState('');
    const [rootDirHandle, setRootDirHandle] = useState(null);
    const [currentFolderHandle, setCurrentFolderHandle] = useState(null);
    const [path, setPath] = useState([]);
    const [folderContent, setFolderContent] = useState([]);
    const [activeFileFullPath, setActiveFileFullPath] = useState(null);

    const [fileLookUp, setFileLookUp] = useState({});
    const [fsAction, setFsAction] = useState();

    // directoryReady
    useEffect(() => {
        const interval = setInterval(async () => {
            setDirectoryReady(await isEntryHealthy(rootDirHandle));
        }, 1000);
        return () => clearInterval(interval);
    }, [rootDirHandle]);

    // statusText
    useEffect(() => {
        setDirectoryStatus(() => {
            if (!rootDirHandle) {
                return 'No Directory Connected';
            }
            if (!directoryReady) {
                return 'Connecting';
            } else {
                const info = 'Connected to ' + rootDirHandle.name;
                return info;
            }
        });
    }, [rootDirHandle, directoryReady]);

    useEffect(() => {
        if (!rootDirHandle) {
            return;
        }
        async function showRoot() {
            setCurrentFolderHandle(rootDirHandle);
            setFolderContent(await folderGetContent(rootDirHandle, false));
            setPath([rootDirHandle]);
        }
        showRoot();
    }, [rootDirHandle]);

    // Open dir
    async function openRootDirectory() {
        try {
            const dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
            });
            if (dirHandle) {
                dirHandle.label = 'ROOT';
                setRootDirHandle(dirHandle);
                setCurrentFolderHandle(dirHandle);
                setFolderContent(await folderGetContent(dirHandle, false));
                setPath([dirHandle]);
            } else {
                throw new Error('Failed to open directory handle. `dirHandle` created but empty'); // not sure wether this is reachiable
            }
        } catch (error) {
            alert(error);
            console.error(error);
        }
    }

    async function folderOpen(folderHandle) {
        setCurrentFolderHandle(folderHandle);
        setFolderContent(await folderGetContent(folderHandle, true));

        for (var i = 0; i < path.length; i++) {
            if (await folderHandle.isSameEntry(path[i])) {
                setPath((curPath) => {
                    return curPath.slice(0, i + 1);
                });
                return;
            }
        }

        setPath((curPath) => {
            return [...curPath, folderHandle];
        });
    }

    async function fileClosed(node) {
        const fullPath = await node.getConfig()?.fullPath;
        if (fullPath) {
            if (fileLookUp[fullPath]?.fileHandle?.unsaved) {
                fileLookUp[fullPath].fileHandle.unsaved = false;
            }
            await setFileLookUp((cur) => {
                return { ...cur, [fullPath]: null };
            });
        }
    }

    return {
        activeFileFullPath,
        currentFolderHandle,
        directoryReady,
        directoryStatus,
        fileClosed,
        fileLookUp,
        folderContent,
        folderOpen,
        fsAction,
        openRootDirectory,
        path,
        rootDirHandle,
        setActiveFileFullPath,
        setFileLookUp,
        setFsAction,
    };
}
