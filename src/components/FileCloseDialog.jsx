import { useState, useEffect, useContext } from "react";
import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";

import { Actions as FlexLayoutActions } from 'flexlayout-react';

import IdeContext from "../contexts/IdeContext";

export default function FileCloseDialog() {

    const { flexModel, fsApi, tabsApi } = useContext(IdeContext);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        setDialogOpen(!!tabsApi.tabToClose);
        const name = tabsApi.tabToClose && tabsApi.tabToClose?.getConfig()?.fileName;
        setFileName(name);
    }, [tabsApi.tabToClose]);

    const handleDialogClose = () => {
        setDialogOpen(false);
        tabsApi.setCancelClosing(true);
    }

    const handleConfirm = async (state) => {
        if (!tabsApi.tabToClose) {
            return;
        }

        if (state === "save") {
            tabsApi.setSaveAndClose(tabsApi.tabToClose);

        } else if (state === "dont-save") {
            if (tabsApi.tabToClose.isEnableClose()) {
                await fsApi.fileClosed(tabsApi.tabToClose);
                flexModel.doAction(FlexLayoutActions.deleteTab(tabsApi.tabToClose.getId()));
            }
            tabsApi.setTabToClose(null);

        } else if (state === "cancel") {
            handleDialogClose();
            tabsApi.setTabToClose(null);

        }
    }

    return (
        <>
            <Dialog
                open={dialogOpen && !!tabsApi.tabToClose}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do you want to save the changes you made to {fileName}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleConfirm("save")} autoFocus>Save</Button>
                    <Button onClick={() => handleConfirm("dont-save")}>Don&apos;t Save</Button>
                    <Button onClick={() => handleConfirm("cancel")}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
