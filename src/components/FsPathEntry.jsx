import PropTypes from "prop-types";
import { useContext } from "react";
import { Button } from "@mui/material";
import ApplyDrop from "./ApplyDrop";
import IdeContext from "../contexts/IdeContext";
import DragContext from "../contexts/DragContext";

export default function FsPathEntry({ entryHandle }) {
    const { fsApi } = useContext(IdeContext);
    const { handleDrop } = useContext(DragContext);

    function onDropHandler() {
        handleDrop(entryHandle);
    }

    function onClickHandler() {
        fsApi.folderOpen(entryHandle);
    }

    return (
        <ApplyDrop onDropHandler={onDropHandler}>
            <Button size="small" onClick={onClickHandler} sx={{ minWidth: 10, textTransform: "none" }}>
                {entryHandle?.label}
            </Button>
        </ApplyDrop>
    );
}

FsPathEntry.propTypes = {
    entryHandle: PropTypes.object,
};
