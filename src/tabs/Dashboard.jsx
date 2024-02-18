// react
import { useEffect, useState, useRef, useContext } from "react";

import widgetsContext from "../dashboard/widgetsContext";

// MUI
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { Responsive as ResponsiveGridLayout } from "react-grid-layout";

// context
import ideContext from "../ideContext";

function ToolbarEntry({ content, fixedWidth = null }) {
    const sx = {
        flexGrow: 1,
        pl: 1,
        fontSize: "14px",
    };

    if (fixedWidth) {
        sx.width = fixedWidth;
    }

    return (
        <Typography
            component="div"
            noWrap={true}
            sx={sx}
        >
            {content}
        </Typography>
    );
}



export default function Dashboard({ node }) {
    const { dashboardLayout, clearDashboard, widgets, updateWidget } = useContext(ideContext);
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
        <Box sx={{ flexGrow: 0, maxHeight: "35px" }}>
            <Divider />
            <Toolbar
                variant="dense"
                disableGutters={true}
                sx={{ minHeight: "35px", maxHeight: "35px" }}
            >
                <ToolbarEntry content={`Dashboard`} />
                <Tooltip
                    key={"clear-dashboard"}
                    id="clear-dashboard"
                    title={"Clear dashboard"}
                >
                    <span>
                        <IconButton
                            edge="start"
                            size="small"
                            style={{ borderRadius: 0 }}
                            onClick={() => {
                                clearDashboard();
                            }}
                            disabled={!dashboardLayout.length}
                        >
                            <DeleteForeverIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip
                    key={"dashboard-lock"}
                    id="dashboard-lock"
                    title={locked ? "Unlock dashboard" : "Lock dashboard"}
                >
                    <IconButton
                        edge="start"
                        size="small"
                        style={{ borderRadius: 0 }}
                        onClick={() => {
                            setLocked(!locked);
                        }}
                    >
                        {locked ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </Box>
        <Divider />
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
                                background: 'white',
                                overflow: 'hidden',
                            }}
                        >
                            { (widgets[item.i] && widgets[item.i].widget) || null }
                        </div>);
                    })}
                </ResponsiveGridLayout>
            </widgetsContext.Provider>
        </Box>
    </>;
}
