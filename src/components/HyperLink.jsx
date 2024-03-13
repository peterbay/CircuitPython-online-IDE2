import PropTypes from "prop-types";
import {
    Button,
} from "@mui/material";

export default function HyperLink({ text, link }) {
    return (
        <Button
            style={{
                textTransform: "none",
            }}
            onClick={() => {
                window.open(link, "_blank");
            }}
        >
            {text}
        </Button>
    );
}

HyperLink.propTypes = {
    text: PropTypes.string,
    link: PropTypes.string,
};
