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

    const { flexModel, fsApi, tabsApi } = useContext(IdeContext);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [entryHandle, setEntryHandle] = useState(false);
    const [parentEntryHandle, setParentEntryHandle] = useState(false);
    const [originalEntryName, setOriginalEntryName] = useState("");
    const [newEntryName, setNewEntryName] = useState("");
    const [newEntryNameNeeded, setNewEntryNameNeeded] = useState(false);
    const [action, setAction] = useState("");
    const [warningLabel, setWarningLabel] = useState("");

    useEffect(() => {
        async function prepare() {

            if (fsApi.fsAction?.action) {
                const action = fsApi.fsAction.action;
                const entryHandle = fsApi.fsAction?.entryHandle;
                const parentEntryHandle = fsApi.fsAction?.parentEntryHandle || entryHandle?.parent;

                setEntryHandle(entryHandle);
                setParentEntryHandle(parentEntryHandle);

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

            } else {
                setDialogOpen(false);
                setOriginalEntryName(null);
                setNewEntryName(null);
                setAction(null);
                setNewEntryNameNeeded(false);

            }

            setWarningLabel("");
        }

        prepare();

    }, [fsApi]);

    const handleDialogClose = () => {
        fsApi.setFsAction(null);
        setDialogOpen(false);
    }

    const handleConfirm = async (state) => {
        if (!dialogOpen || !action) {
            return;
        }

        if (state === "confirm" && (entryHandle || parentEntryHandle)) {

            if (newEntryNameNeeded) {
                if (action === "rename" && newEntryName === originalEntryName) {
                    // nothing to do
                    handleDialogClose();
                    return;
                }

                if (await entryExists(parentEntryHandle, newEntryName)) {
                    setWarningLabel(`'${newEntryName}' is an existing name. Please use unique name.`);
                    return;
                }
            }

            if (action === "rename") {
                await entryRename(entryHandle, newEntryName);

            } else if (action === "duplicate") {
                await entryCopy(entryHandle, parentEntryHandle, newEntryName);

            } else if (action === "delete") {
                await entryRemove(entryHandle);
                const tabs = tabsApi.tabsGetByFullPath(entryHandle.fullPath, "equal");
                if (tabs.length > 0) {
                    flexModel.doAction(FlexLayoutActions.deleteTab(tabs[0].getId()));
                }

            } else if (action === "new_file") {
                const newFileHandle = await fileCreate(parentEntryHandle, newEntryName);
                newFileHandle.fullPath = (parentEntryHandle.fullPath || "") + "/" + newFileHandle.name;
                tabsApi.tabOpenFile(newFileHandle, false, true);

            } else if (action === "new_folder") {
                await folderCreate(parentEntryHandle, newEntryName);
            }

            await fsApi.folderOpen(parentEntryHandle);
        }
        handleDialogClose();
    }

    const changeNewEntryName = (e) => {
        const value = e.target.value;
        setNewEntryName(value.toString().trim());
    }

    return (
        <Dialog
            open={dialogOpen && !!fsApi.fsAction?.action}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
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
                        autoFocus
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
                        inputRef={input => input && input.focus()}
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
