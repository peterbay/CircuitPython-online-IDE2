// react
import { useEffect, useState, useContext } from "react";

import widgetsContext from "../dashboard/widgetsContext";

// MUI
import {
    Box,
    Divider,
    Toolbar,
} from "@mui/material";

import {
    DeleteForever as DeleteForeverIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
} from '@mui/icons-material';

import { Responsive as ResponsiveGridLayout } from "react-grid-layout";

import { ToolbarEntry } from "../components/ToolbarEntry";
import { ToolbarIconButton } from "../components/ToolbarIconButton";

// context
import ideContext from "../ideContext";

export default function Dashboard({ node }) {
    const { dashboardLayout, clearDashboard, widgets, updateWidget, isDarkMode } = useContext(ideContext);
    const parentHeight = node.getRect().height;
    const parentWidth = node.getRect().width;

    const [layout, setLayout] = useState(dashboardLayout);
    const [locked, setLocked] = useState(true);

    const rowHeight = 40;

    useEffect(() => {
        if (!dashboardLayout.length) {
            setLayout([]);
            return;
        }

        setLayout(dashboardLayout);
    }, [dashboardLayout]);

    const updateLayout = (layout) => {
        layout.forEach((item) => {
            updateWidget(item.i, item);
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
                        <ToolbarEntry content={`Dashboard`} />

                        <ToolbarIconButton
                            id="clear-dashboard"
                            title="Clear dashboard"
                            icon={DeleteForeverIcon}
                            disabled={!dashboardLayout.length}
                            onClick={() => clearDashboard()}
                        />

                        <ToolbarIconButton
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
                                        background: isDarkMode ? 'rgb(66, 66, 66)' : 'white',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {(widgets[item.i] && widgets[item.i].widget) || null}
                                </div>);
                            })}
                        </ResponsiveGridLayout>
                    </widgetsContext.Provider>
                </Box>
            </div>
        </div>
    </>;
}
