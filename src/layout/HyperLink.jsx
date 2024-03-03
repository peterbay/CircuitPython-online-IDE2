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
