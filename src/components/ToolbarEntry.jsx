import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";

export default function ToolbarEntry({ children, fixedWidth = null, maxWidth = null}) {
    const sx = {
        flexGrow: 1,
        pl: 1,
        fontSize: "14px",
    };

    if (fixedWidth) {
        sx.width = fixedWidth;
    }

    if (maxWidth) {
        sx.maxWidth = maxWidth;
    }

    return (
        <Typography
            component="div"
            noWrap={true}
            sx={sx}
        >
            {children}
        </Typography>
    );
}

ToolbarEntry.propTypes = {
    children: PropTypes.any,
    fixedWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
