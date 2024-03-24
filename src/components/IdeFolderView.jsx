import { useContext } from "react";
import { Button } from "@mui/material";
import FsFolderView from "./FsFolderView"
import IdeContext from "../contexts/IdeContext";

export default function IdeFolderView() {
    const { fsApi } = useContext(IdeContext);

    // Show FolderView component only when its ready
    return fsApi.directoryReady ? (
        <div style={{ height: "100%" }}>
            <FsFolderView />
        </div>
    ) : (
        <>
            <Button onClick={fsApi.openRootDirectory}>Open CircuitPy Drive</Button>
        </>
    );
}
