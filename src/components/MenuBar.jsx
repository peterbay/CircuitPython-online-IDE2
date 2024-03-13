import PropTypes from "prop-types";
import {
    Button,
    Stack,
} from "@mui/material";

import {
    deepPurple,
} from "@mui/material/colors";

import Menu from "./Menu";

export default function MenuBar({ menuStructure }) {
    return (
        <Stack direction="row" spacing={0}>
            <Button
                disabled
                style={{
                    textTransform: "none",
                    color: deepPurple[500],
                }}
            >
                {menuStructure.title}
            </Button>
            {menuStructure.menu.map((column) => {
                return <Menu label={column.label} options={column.options} key={"menu_key_" + column.label} />;
            })}
        </Stack>
    );
}

MenuBar.propTypes = {
    menuStructure: PropTypes.object,
};
