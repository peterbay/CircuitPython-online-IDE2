import PropTypes from "prop-types";
import {
    useState,
} from "react";

import {
    Box,
    Modal,
    Typography,
} from "@mui/material";

export default function WarningModal({ title, children, closeEnabled }) {
    const [open, setOpen] = useState(true);
    const handleClose = closeEnabled ? () => setOpen(false) : () => { };

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(min(100% - 100px, 500px))",
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
    };
    return (
        <Modal
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
        </Modal>
    );
}

WarningModal.propTypes = {
    title: PropTypes.string,
    children: PropTypes.any,
    closeEnabled: PropTypes.bool,
};
