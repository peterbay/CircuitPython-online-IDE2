import PropTypes from "prop-types";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import { useEffect, useState, useContext } from "react";
import {
    Box,
    Divider,
    Toolbar,
} from "@mui/material";
import {
    DeleteForever as DeleteForeverIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    Link as LinkIcon,
    LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import widgetsContext from "../contexts/WidgetsContext";
import ToolbarEntry from "./ToolbarEntry";
import TooltipIconButton from "./TooltipIconButton";
import IdeContext from "../contexts/IdeContext";

export default function Dashboard({ node }) {
    const { dashboardApi, themeApi, serialApi } = useContext(IdeContext);
    const parentHeight = node.getRect().height;
    const parentWidth = node.getRect().width;

    const [layout, setLayout] = useState(dashboardApi.dashboardLayout);
    const [locked, setLocked] = useState(true);
    const [linked, setLinked] = useState(true);

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

    const updateLayout = (layout) => {
        layout.forEach((item) => {
            dashboardApi.updateWidget(item.i, item);
        });
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
                    <Divider />
                    <Toolbar
                        variant="dense"
                        disableGutters={true}
                        sx={{ minHeight: "35px", maxHeight: "35px" }}
                    >
                        <ToolbarEntry>Dashboard</ToolbarEntry>

                        <TooltipIconButton
                            id="link-dashboard"
                            title={linked ? "Unlink dashboard from serial console"
                                : "Link dashboard to serial console"}
                            icon={linked ? LinkIcon : LinkOffIcon}
                            disabled={!serialApi.serialStatus}
                            onClick={() => linkToggle()}
                        />

                        <TooltipIconButton
                            id="clear-dashboard"
                            title="Clear dashboard"
                            icon={DeleteForeverIcon}
                            disabled={!dashboardApi.dashboardLayout.length}
                            onClick={() => dashboardApi.clearDashboard()}
                        />

                        <TooltipIconButton
                            id="dashboard-lock"
                            title={locked ? "Unlock dashboard" : "Lock dashboard"}
                            icon={locked ? LockIcon : LockOpenIcon}
                            onClick={() => setLocked(!locked)}
                        />
                    </Toolbar>
                </Box>
                <Divider />
            </div>
            <div
                style={{
                    flexGrow: 1,
                    overflow: "auto",
                }}
            >
                <Box sx={{
                    flexGrow: 1,
                    width: parentWidth + 'px',
                    height: "calc(" + parentHeight + "px - 36px)",
                }}>
                    <widgetsContext.Provider
                        value={{
                            locked,
                        }}
                    >
                        <ResponsiveGridLayout
                            className="dashboard-layout"
                            layout={layout}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                            cols={{ lg: 6, md: 6, sm: 3, xs: 1, xxs: 1 }}
                            margin={[10, 10]}
                            rowHeight={rowHeight}
                            width={parentWidth - 20}
                            isDraggable={!locked}
                            isResizable={!locked}
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
                    </widgetsContext.Provider>
                </Box>
            </div>
        </div>
    </>;
}

Dashboard.propTypes = {
    node: PropTypes.object,
};
