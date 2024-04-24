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
    const [buttonsActive, setButtonsActive] = useState(true);

    useEffect(() => {
        setDialogOpen(!!tabsApi.tabToClose);
        if (tabsApi.tabToClose) {
            const name = tabsApi.tabToClose && tabsApi.tabToClose?.getConfig()?.fileName;
            setFileName(name);
            setButtonsActive(true);
        } else {
            setFileName(null);
        }
    }, [tabsApi.tabToClose]);

    const handleDialogClose = () => {
        setButtonsActive(false);
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
                    <DialogContentText
                        sx={{
                            color: "text.disabled",
                            fontSize: "0.8rem",
                            marginTop: "20px",
                        }}
                    >
                        Your changes will be lost if you don&apos;t save them.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => handleConfirm("save")}
                        autoFocus
                        disabled={!buttonsActive}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={() => handleConfirm("dont-save")}
                        disabled={!buttonsActive}
                    >
                        Don&apos;t Save
                    </Button>
                    <Button
                        onClick={() => handleConfirm("cancel")}
                        disabled={!buttonsActive}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
