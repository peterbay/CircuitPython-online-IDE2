import filesSettings from '../settings/filesSettings';

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

const fileWriteUploaded = async function (currentFolder, file) {
    const fileHandle = await fileCreate(currentFolder, file.name);
    const writable = await fileHandle.createWritable();
    await writable.write(file);
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

const extendEntryOtions = function (entryHandle) {
    /* eslint-disable no-useless-escape */
    const matchExtension = entryHandle.name.match(/\.([^\.]+)$/i);
    const extension = matchExtension ? matchExtension[1].toLowerCase() : null;
    const fileOptions = (extension && filesSettings.extension[extension]) || filesSettings.default;

    entryHandle.label = entryHandle.name === '\\' ? 'ROOT' : entryHandle.name;
    entryHandle.extension = extension;
    entryHandle.isFolder = entryHandle.kind === 'directory';
    entryHandle.isBinary = fileOptions.isBinary;
    entryHandle.canRun = fileOptions.canRun;
    entryHandle.class = fileOptions.class;
    entryHandle.isReadOnly = fileOptions.isBinary;
};

const folderGetContent = async function (folderHandle, withParent = false) {
    const layer = [];
    if (withParent && folderHandle.parent) {
        const parentEntry = folderHandle.parent;
        parentEntry.isParent = true;
        extendEntryOtions(parentEntry);
        layer.push(parentEntry);
    }
    for await (const entry of await folderHandle.values()) {
        entry.parent = folderHandle;
        entry.isParent = false;
        entry.fullPath = (folderHandle.fullPath || '') + '/' + entry.name;
        extendEntryOtions(entry);
        layer.push(entry);
    }

    layer.sort((a, b) => {
        if (a.isParent && !b.isParent) {
            return -1;
        }
        if (!a.isParent && b.isParent) {
            return 1;
        }
        if (a.isFolder && !b.isFolder) {
            return -1;
        }
        if (!a.isFolder && b.isFolder) {
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
        await entryRemove(folder_content[i]);
    }
};

/* entry manipulation functions */

const getDuplicateName = async function (parentHandle, entry) {
    let cloneIndex = 0;
    let namePart = entry.name;
    let extensionPart = null;

    if (!isFolder(entry)) {
        /* eslint-disable no-useless-escape */
        const fileNameParts = entry.name.match(/^(.*)(\.[^\.]+)$/);
        if (fileNameParts) {
            namePart = fileNameParts[1];
            extensionPart = fileNameParts[2];
        }
    }

    let cloneName = namePart + '_copy' + (extensionPart || '');
    while (await entryExists(parentHandle, cloneName)) {
        cloneIndex++;
        cloneName = namePart + '_copy_' + cloneIndex.toString() + (extensionPart || '');
    }

    return cloneName;
};

const entryRename = async function (entryHandle, newName) {
    const newEntryHandle = await entryCopy(entryHandle, entryHandle.parent, newName);
    await entryRemove(entryHandle);
    return newEntryHandle;
};

const entryMove = async function (entryHandle, targetFolderHandle) {
    const newEntryHandle = await entryCopy(entryHandle, targetFolderHandle, entryHandle.name);
    await entryRemove(entryHandle);
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

const entryRemove = async function (entryHandle) {
    // Will not work without https
    if (isFolder(entryHandle)) {
        await folderPurge(entryHandle);
    }
    await entryHandle.parent.removeEntry(entryHandle.name);
};

/* private functions */

const _folderCopy = async function (folderHandle, targetFolderHandle, newName) {
    const newFolderHandle = await folderCreate(targetFolderHandle, newName);
    for (const entry of await folderGetContent(folderHandle)) {
        await entryCopy(entry, newFolderHandle, entry.name);
    }
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
    fileWriteUploaded,
    folderCreate,
    folderExists,
    folderGetContent,
    folderPurge,
    getDuplicateName,
    isEntryHealthy,
    isFolder,
};
