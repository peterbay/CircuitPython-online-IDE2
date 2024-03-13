import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";

import { Actions as FlexLayoutActions } from 'flexlayout-react';

export default function FileCloseDialog({ model, tabToClose, setTabToClose, setCancelClosing, setSaveAndClose }) {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        setDialogOpen(!!tabToClose);

        const name = tabToClose && tabToClose.getName()?.toString()
            .replace("🔒 ", "")
            .replace("✏️ ", "");

        setFileName(name);

    }, [tabToClose]);

    const handleDialogClose = () => {
        setDialogOpen(false);
        setCancelClosing(true);
    }

    const handleConfirm = (state) => {
        if (!tabToClose) {
            return;
        }

        if (state === "save") {
            setSaveAndClose(tabToClose);

        } else if (state === "dont-save") {
            if (tabToClose.isEnableClose()) {
                model.doAction(FlexLayoutActions.deleteTab(tabToClose.getId()));
            }
            setTabToClose(null);

        } else if (state === "cancel") {
            handleDialogClose();
            setTabToClose(null);

        }
    }

    return (
        <>
            <Dialog
                open={dialogOpen && !!tabToClose}
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

FileCloseDialog.propTypes = {
    model: PropTypes.object,
    tabToClose: PropTypes.object,
    setTabToClose: PropTypes.func,
    setCancelClosing: PropTypes.func,
    setSaveAndClose: PropTypes.func,
};
