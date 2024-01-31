import { useContext } from "react";
import FolderView from "../react-local-file-system";
import Button from "@mui/material/Button";
//context
import ideContext from "../ideContext";

export default function IdeFolderView({ onFileClick, node, activeEditorInfo }) {
    const { openDirectory, directoryReady, rootDirHandle } = useContext(ideContext);
    console.log(node.getParent());
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
