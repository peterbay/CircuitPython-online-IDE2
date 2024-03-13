import PropTypes from "prop-types";
import { useContext } from "react";
import { Button } from "@mui/material";
import ApplyDrop from "./ApplyDrop";
import CurFolderContext from "../contexts/CurFolderContext";
import DragContext from "../contexts/DragContext";
import { getPathEntryLabel } from "../utils/fsUiUtils";

export default function PathEntry({ entryHandle }) {
    const { showFolderView } = useContext(CurFolderContext);
    const { handleDrop } = useContext(DragContext);

    function onDropHandler() {
        handleDrop(entryHandle);
    }

    function onClickHandler() {
        showFolderView(entryHandle);
    }

    return (
        <ApplyDrop onDropHandler={onDropHandler}>
            <Button size="small" onClick={onClickHandler} sx={{ minWidth: 10, textTransform: "none" }}>
                {getPathEntryLabel(entryHandle.name)}
            </Button>
        </ApplyDrop>
    );
}

PathEntry.propTypes = {
    entryHandle: PropTypes.object,
};
