import { entryExists, isFolder } from './fsUtils';

const getDuplicateName = async function getDuplicateName(parentHandle, entry) {
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

const getPathEntryLabel = function getPathEntryLabel(entryName) {
    return entryName === '\\' ? 'ROOT' : entryName;
};

const promptUniqueName = async function (folderHandle, promptLabel, actualName) {
    const newName = prompt(promptLabel, actualName);
    if (!newName || newName === actualName) {
        return;
    }
    if (await entryExists(folderHandle, newName)) {
        alert('"' + newName + '" is an existing name.\nPlease try again with another name.');
        return;
    }
    return newName;
};

export { getDuplicateName, getPathEntryLabel, promptUniqueName };
