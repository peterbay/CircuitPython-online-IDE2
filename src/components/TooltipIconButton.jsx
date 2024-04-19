import PropTypes from "prop-types";

import {
    Tooltip,
    IconButton,
} from "@mui/material";

export default function TooltipIconButton({ id, title, icon, iconSx = {}, disabled = false, onClick }) {
    const IconTag = icon;

    return (
        <Tooltip
            key={id}
            id={id}
            title={title}
            disabled={disabled}
        >
            <span>
                <IconButton
                    edge="start"
                    size="small"
                    style={{ borderRadius: 0 }}
                    onClick={onClick}
                    disabled={disabled}
                >
                    <IconTag sx={iconSx} />
                </IconButton>
            </span>
        </Tooltip>
    );
}

TooltipIconButton.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.elementType,
    iconSx: PropTypes.object,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
};
