import PropTypes from "prop-types";
import {
    useState,
} from "react";

import {
    Box,
    Dialog,
    Typography,
} from "@mui/material";

export default function WarningModal({ title, children, closeEnabled }) {
    const [open, setOpen] = useState(true);
    const handleClose = closeEnabled ? () => setOpen(false) : () => { };

    const style = {
        bgcolor: "background.paper",
        border: "2px solid #000",
        p: 2,
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {title}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    {children}
                </Typography>
            </Box>
        </Dialog>
    );
}

WarningModal.propTypes = {
    title: PropTypes.string,
    children: PropTypes.any,
    closeEnabled: PropTypes.bool,
};
