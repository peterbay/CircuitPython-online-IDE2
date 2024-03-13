/* file manipulation functions */

const fileExists = async function (parentHandle, fileName) {
    try {
        await parentHandle.getFileHandle(fileName);
        return true;
    } catch {
        return false;
    }
};

const fileCreate = async function (parentHandle, newFileName) {
    return await parentHandle.getFileHandle(newFileName, {
        create: true,
    });
};

const fileReadText = async function (fileHandle) {
    const file = await fileHandle.getFile();
    const contents = await file.text();
    return String(contents);
};

const fileWriteText = async function (fileHandle, text) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(text);
    // Close the file and write the contents to disk.
    await writable.close();
};

/* folder manipulation functions */

const folderExists = async function (parentHandle, folderName) {
    try {
        await parentHandle.getDirectoryHandle(folderName);
        return true;
    } catch {
        return false;
    }
};

const folderCreate = async function (parentHandle, newFolderName) {
    return await parentHandle.getDirectoryHandle(newFolderName, {
        create: true,
    });
};

const isFolder = function (entryHandle) {
    return entryHandle.kind === 'directory';
};

const folderGetContent = async function (folderHandle, withParent = false) {
    const layer = [];
    if (withParent && folderHandle.parent) {
        const parentEntry = folderHandle.parent;
        parentEntry.isParent = true;
        layer.push(parentEntry);
    }
    for await (const entry of await folderHandle.values()) {
        /* eslint-disable no-useless-escape */
        const matchExtension = entry.name.match(/\.([^\.]+)$/i);

        entry.parent = folderHandle;
        entry.isParent = false;
        entry.fullPath = (folderHandle.fullPath || '') + '/' + entry.name;
        entry.extension = matchExtension ? matchExtension[1].toLowerCase() : null;

        layer.push(entry);
    }

    layer.sort((a, b) => {
        if (a.isParent && !b.isParent) {
            return -1;
        }
        if (!a.isParent && b.isParent) {
            return 1;
        }
        if (isFolder(a) && !isFolder(b)) {
            return -1;
        }
        if (!isFolder(a) && isFolder(b)) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return layer;
};

const folderPurge = async function (parentHandle) {
    const folder_content = await folderGetContent(parentHandle);
    folder_content.sort((a, b) => {
        if (a.name.startsWith('.')) {
            return -1;
        }
        if (b.name.startsWith('.')) {
            return 1;
        }
        return 0;
    });
    for (var i = 0; i < folder_content.length; i++) {
        await entryRemove(parentHandle, folder_content[i]);
    }
};

const folderBackup = async function (folderHandle, newFolderHandle, clean = false) {
    if (clean) {
        await folderPurge(newFolderHandle);
    }
    for (const entry of await folderGetContent(folderHandle)) {
        await entryCopy(entry, newFolderHandle, entry.name);
    }
};

/* entry manipulation functions */

const entryRename = async function (parentHandle, entryHandle, newName) {
    const newEntryHandle = await entryCopy(entryHandle, parentHandle, newName);
    await entryRemove(parentHandle, entryHandle);
    return newEntryHandle;
};

const entryMove = async function (parentHandle, entryHandle, targetFolderHandle) {
    const newEntryHandle = await entryCopy(entryHandle, targetFolderHandle, entryHandle.name);
    await entryRemove(parentHandle, entryHandle);
    return newEntryHandle;
};

const isEntryHealthy = async function (entryHandle) {
    if (entryHandle === null) {
        return false;
    }
    if (isFolder(entryHandle)) {
        try {
            // eslint-disable-next-line no-unused-vars
            for await (const [key, value] of entryHandle.entries()) {
                break;
            }
            return true;
        } catch {
            return false;
        }
    } else {
        try {
            await fileReadText(entryHandle);
            return true;
        } catch {
            return false;
        }
    }
};

const entryExists = async function (parentHandle, entryName) {
    return (await fileExists(parentHandle, entryName)) || (await folderExists(parentHandle, entryName));
};

const entryCopy = async function (entryHandle, targetFolderHandle, newName) {
    if (isFolder(entryHandle)) {
        return await _folderCopy(entryHandle, targetFolderHandle, newName);
    } else {
        return await _fileCopy(entryHandle, targetFolderHandle, newName);
    }
};

const entryRemove = async function (parentHandle, entryHandle) {
    // Will not work without https
    if (isFolder(entryHandle)) {
        await folderPurge(entryHandle);
        await parentHandle.removeEntry(entryHandle.name);
    } else {
        await parentHandle.removeEntry(entryHandle.name);
    }
};

/* private functions */

const _folderCopy = async function (folderHandle, targetFolderHandle, newName) {
    const newFolderHandle = await folderCreate(targetFolderHandle, newName);
    await folderBackup(folderHandle, newFolderHandle);
    return newFolderHandle;
};

const _fileCopy = async function (fileHandle, targetFolderHandle, newName) {
    const fileData = await fileHandle.getFile();
    const newFileHandle = await fileCreate(targetFolderHandle, newName);
    const writable = await newFileHandle.createWritable();
    await writable.write(fileData);
    await writable.close();
    return newFileHandle;
};

/* export */

export {
    entryCopy,
    entryExists,
    entryMove,
    entryRemove,
    entryRename,
    fileCreate,
    fileExists,
    fileReadText,
    fileWriteText,
    folderBackup,
    folderCreate,
    folderExists,
    folderGetContent,
    folderPurge,
    isEntryHealthy,
    isFolder,
};
