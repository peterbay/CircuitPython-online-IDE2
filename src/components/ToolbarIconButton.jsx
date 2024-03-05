import {
    Tooltip,
    IconButton,
} from "@mui/material";

export function ToolbarIconButton({ id, title, icon, iconSx = {}, disabled = false, onClick }) {
    const IconTag = icon;

    return (
        <Tooltip
            key={id}
            id={id}
            title={title}
        >
            <span>
                <IconButton
                    edge="start"
                    size="small"
                    style={{borderRadius: 0}}
                    onClick={onClick}
                    disabled={disabled}
                >
                    <IconTag sx={iconSx} />
                </IconButton>
            </span>
        </Tooltip>
    );
}
