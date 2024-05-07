import PropTypes from "prop-types";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import { useEffect, useState, useContext } from "react";
import {
    Box,
    Divider,
    Toolbar,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import {
    DeleteForever as DeleteForeverIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    Link as LinkIcon,
    LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";
import IdeContext from "../contexts/IdeContext";

export default function Dashboard({ node }) {
    const { dashboardApi, themeApi, serialApi } = useContext(IdeContext);
    const parentHeight = node.getRect().height;
    const parentWidth = node.getRect().width;

    const [layout, setLayout] = useState(dashboardApi.dashboardLayout);
    const [linked, setLinked] = useState(true);
    const [buttonsActive, setButtonsActive] = useState(true);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    const rowHeight = 40;

    const readerCallback = function (data) {
        if (linked) {
            dashboardApi.processLine(data);
        }
    }.bind(this);

    useEffect(() => {
        if (!dashboardApi.dashboardLayout.length) {
            setLayout([]);
            return;
        }

        setLayout(dashboardApi.dashboardLayout);
    }, [dashboardApi.dashboardLayout]);

    useEffect(() => {
        if (!serialApi.serial) {
            return;
        }
        if (linked) {
            serialApi.serial.registerReaderCallback('dashboard', readerCallback);
        } else {
            serialApi.serial.unregisterReaderCallback('dashboard');
        }
        return () => {
            serialApi.serial.unregisterReaderCallback('dashboard');
        }
    }, [linked, readerCallback, serialApi.serial]);

    const linkToggle = function () {
        setLinked(!linked);
    }

    const updateLayout = function (layout) {
        layout.forEach((item) => {
            dashboardApi.updateWidget(item.i, item);
        });
    };

    const handleConfirm = function (state) {
        setButtonsActive(false);
        if (state) {
            dashboardApi.clearDashboard();
            dashboardApi.setLocked(true);
        }
        setClearDialogOpen(false);
    };

    return <>
        <div
            style={{
                height: "100%",
                width: "100%",
                maxHeight: "100%",
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    flexGrow: 0,
                }}
            >
                <Box sx={{ flexGrow: 0, maxHeight: "35px" }}>
                    <Toolbar
                        variant="dense"
                        disableGutters={true}
                        sx={{ minHeight: "35px", maxHeight: "35px" }}
                    >
                        <ToolbarEntry>Dashboard</ToolbarEntry>

                        <TooltipIconButton
                            id="clear-dashboard"
                            title="Clear dashboard"
                            icon={DeleteForeverIcon}
                            disabled={!dashboardApi.dashboardLayout.length}
                            onClick={() => {
                                setButtonsActive(true);
                                setClearDialogOpen(true);
                            }}
                        />

                        <div style={{ width: '30px' }}></div>

                        <TooltipIconButton
                            id="link-dashboard"
                            title={linked ? "Unlink dashboard from serial console"
                                : "Link dashboard to serial console"}
                            icon={linked ? LinkIcon : LinkOffIcon}
                            disabled={!serialApi.serialStatus}
                            onClick={() => linkToggle()}
                        />

                        <TooltipIconButton
                            id="dashboard-lock"
                            title={dashboardApi.locked ? "Unlock dashboard" : "Lock dashboard"}
                            icon={dashboardApi.locked ? LockIcon : LockOpenIcon}
                            onClick={() => dashboardApi.setLocked(!dashboardApi.locked)}
                        />
                    </Toolbar>
                </Box>
                <Divider />
            </div>
            <div
                style={{
                    flexGrow: 1,
                    overflow: "auto",
                    width: `${parentWidth}px`,
                }}
            >
                <Box sx={{
                    flexGrow: 1,
                    width: `${parentWidth}px`,
                    height: "calc(" + parentHeight + "px - 36px)",
                }}>
                    <ResponsiveGridLayout
                        className="dashboard-layout"
                        layout={layout}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 6, md: 6, sm: 3, xs: 1, xxs: 1 }}
                        margin={[10, 10]}
                        rowHeight={rowHeight}
                        width={parentWidth - 20}
                        isDraggable={!dashboardApi.locked}
                        isResizable={!dashboardApi.locked}
                        draggableHandle=".widget-header"
                        onLayoutChange={updateLayout}
                    >
                        {layout.map((item) => {
                            return (<div
                                id="widget-container"
                                key={item.i}
                                data-grid={item}
                                style={{
                                    background: themeApi.isDarkMode ? 'rgb(66, 66, 66)' : 'white',
                                    overflow: 'hidden',
                                }}
                            >
                                {(dashboardApi.widgets[item.i] && dashboardApi.widgets[item.i].widget) || null}
                            </div>);
                        })}
                    </ResponsiveGridLayout>
                </Box>
            </div>
        </div>
        <Dialog
            open={clearDialogOpen}
            onClose={handleConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Do you want to clear the dashboard?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => handleConfirm(true)}
                    autoFocus
                    disabled={!buttonsActive}
                >
                    Clear
                </Button>
                <Button
                    onClick={() => handleConfirm(false)}
                    disabled={!buttonsActive}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    </>;
}

Dashboard.propTypes = {
    node: PropTypes.object,
};
