import PropTypes from "prop-types";
import { useContext } from "react";
import { Button } from "@mui/material";
import FolderView from "./FsFolderView"
import IdeContext from "../contexts/IdeContext";

export default function IdeFolderView({ onFileClick, activeEditorInfo }) {
    const { openDirectory, directoryReady, rootDirHandle } = useContext(IdeContext);
    // Show FolderView component only when its ready
    return directoryReady ? (
        <div style={{ height: "100%" }}>
            <FolderView
                rootFolder={rootDirHandle}
                onFileClick={onFileClick}
                activeEditorInfo={activeEditorInfo}
            />
        </div>
    ) : (
        <>
            <Button onClick={openDirectory}>Open CircuitPy Drive</Button>
        </>
    );
}

IdeFolderView.propTypes = {
    onFileClick: PropTypes.func,
    activeEditorInfo: PropTypes.object,
};
