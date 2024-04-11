import { useState, useEffect, useContext } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from "@mui/material";

import { entryExists } from "../utils/fsUtils";
import IdeContext from "../contexts/IdeContext";

import { Actions as FlexLayoutActions } from "flexlayout-react";

import {
    entryCopy,
    entryRemove,
    entryRename,
    fileCreate,
    folderCreate,
    getDuplicateName,
} from "../utils/fsUtils";

export default function FsActionDialog() {

    const { flexModel, fsApi, tabsApi, infoApi } = useContext(IdeContext);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [originalEntryName, setOriginalEntryName] = useState("");
    const [newEntryName, setNewEntryName] = useState("");
    const [newEntryNameNeeded, setNewEntryNameNeeded] = useState(false);
    const [action, setAction] = useState("");
    const [warningLabel, setWarningLabel] = useState("");

    useEffect(() => {
        async function prepare() {
            const action = fsApi.fsAction.action;
            const entryHandle = fsApi.fsAction?.entryHandle;
            const parentEntryHandle = fsApi.fsAction?.parentEntryHandle || entryHandle?.parent;

            if (["rename", "duplicate", "new_file", "new_folder"].includes(action)) {
                setNewEntryNameNeeded(true);
            } else {
                setNewEntryNameNeeded(false);
            }

            if (action === "rename" || action === "delete") {
                setOriginalEntryName(entryHandle?.name);
                setNewEntryName(entryHandle?.name);

            } else if (action === "duplicate") {
                const duplicateName = await getDuplicateName(parentEntryHandle, entryHandle);
                setOriginalEntryName(entryHandle?.name);
                setNewEntryName(duplicateName);

            } else {
                setOriginalEntryName("");
                setNewEntryName("");

            }

            setAction(action);
            setDialogOpen(true);

            setWarningLabel("");
        }

        if (!dialogOpen && fsApi.fsAction?.action) {
            prepare();
        }

    }, [dialogOpen, fsApi]);

    const handleConfirm = async (state) => {
        if (!dialogOpen || !action) {
            return;
        }

        const entryHandle = fsApi.fsAction?.entryHandle;
        const parentEntryHandle = fsApi.fsAction?.parentEntryHandle || entryHandle?.parent;

        const entryType = entryHandle?.isFolder ? "Folder" : "File";
        const entryTypeLower = entryHandle?.isFolder ? "folder" : "file";

        if (state === "confirm" && (entryHandle || parentEntryHandle)) {

            if (newEntryNameNeeded) {
                if (action === "rename" && newEntryName === originalEntryName) {
                    // nothing to do
                    setDialogOpen(false);
                    return;
                }

                if (await entryExists(parentEntryHandle, newEntryName)) {
                    setWarningLabel(`'${newEntryName}' is an existing name. Please use unique name.`);
                    return;
                }
            }

            if (action === "rename") {
                try {
                    await entryRename(entryHandle, newEntryName);
                    infoApi.successMessage(`${entryType} renamed from '${entryHandle.name}' to '${newEntryName}'.`);

                } catch (error) {
                    infoApi.errorMessage(`Failed to rename ${entryTypeLower} to '${newEntryName}'.`);

                }

            } else if (action === "duplicate") {
                try {
                    await entryCopy(entryHandle, parentEntryHandle, newEntryName);
                    infoApi.successMessage(`${entryType} '${entryHandle.name}' duplicated as '${newEntryName}'.`);

                } catch (error) {
                    infoApi.errorMessage(`Failed to duplicate ${entryTypeLower} '${entryHandle.name}'.`);

                }

            } else if (action === "delete") {
                try {
                    await entryRemove(entryHandle);
                    infoApi.successMessage(`${entryType} '${entryHandle.name}' deleted.`);

                } catch (error) {
                    infoApi.errorMessage(`Failed to delete ${entryTypeLower} '${entryHandle.name}'.`);

                }

                const tabs = tabsApi.tabsGetByFullPath(entryHandle.fullPath, "equal");
                if (tabs.length > 0) {
                    flexModel.doAction(FlexLayoutActions.deleteTab(tabs[0].getId()));
                }

            } else if (action === "new_file") {
                try {
                    const newFileHandle = await fileCreate(parentEntryHandle, newEntryName);
                    newFileHandle.fullPath = (parentEntryHandle.fullPath || "") + "/" + newFileHandle.name;
                    tabsApi.tabOpenFile(newFileHandle, false, true);
                    infoApi.successMessage(`New file '${newEntryName}' created.`);

                } catch (error) {
                    infoApi.errorMessage(`Failed to create new file '${newEntryName}'.`);

                }

            } else if (action === "new_folder") {
                try {
                    await folderCreate(parentEntryHandle, newEntryName);
                    infoApi.successMessage(`New folder '${newEntryName}' created.`);

                } catch (error) {
                    infoApi.errorMessage(`Failed to create new folder '${newEntryName}'.`);

                }
            }

            await fsApi.folderOpen(parentEntryHandle);
        }

        fsApi.setFsAction(null);
        setDialogOpen(false);
    }

    const changeNewEntryName = (e) => {
        setNewEntryName((e.target.value || "").trim());
    }

    return (
        <Dialog
            open={dialogOpen && !!fsApi.fsAction?.action}
            onClose={() => {
                setDialogOpen(false);
                fsApi.setFsAction(null);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            disableRestoreFocus={true}
        >
            <DialogTitle>
                {action === "rename" && `Rename`}
                {action === "duplicate" && `Duplicate`}
                {action === "delete" && `Delete`}
                {action === "new_file" && `New file`}
                {action === "new_folder" && `New folder`}
            </DialogTitle>

            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {action === "rename" && `Please enter a new name for '${originalEntryName}':`}
                    {action === "duplicate" && `Please enter a name for '${originalEntryName}' clone:`}
                    {action === "delete" && `Are you sure you want to delete '${originalEntryName}'?`}
                    {action === "new_file" && `New file name:`}
                    {action === "new_folder" && `New folder name:`}
                </DialogContentText>

                {newEntryNameNeeded && (
                    <TextField
                        autoComplete='off'
                        autoFocus={true}
                        fullWidth
                        id="name"
                        margin="dense"
                        required={true}
                        size="small"
                        type="text"
                        value={newEntryName}
                        onChange={changeNewEntryName}
                        onKeyDown={(ev) => {
                            if (ev.key === 'Escape') {
                                handleConfirm("cancel");

                            } else if (ev.key === 'Enter') {
                                ev.preventDefault();
                                handleConfirm("confirm");
                            }
                        }}
                    />
                )}

                <DialogContentText id="alert-dialog-description">
                    {warningLabel}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleConfirm("confirm")}>Confirm</Button>
                <Button onClick={() => handleConfirm("cancel")}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
