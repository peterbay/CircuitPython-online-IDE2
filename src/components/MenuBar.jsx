import PropTypes from "prop-types";
import {
    Typography,
    Stack,
} from "@mui/material";

import Menu from "./Menu";

export default function MenuBar({ menuStructure }) {
    return (
        <Stack direction="row" spacing={0}>
            <Typography
                component="div"
                noWrap={true}
                sx={{
                    paddingTop: "6px",
                    paddingLeft: "10px",
                    paddingRight: "40px",
                }}
            >
                {menuStructure.title}
            </Typography>
            {menuStructure.menu.map((column) => {
                return <Menu
                    label={column.label}
                    options={column.options}
                    key={"menu_key_" + column.label}
                />;
            })}
        </Stack>
    );
}

MenuBar.propTypes = {
    menuStructure: PropTypes.object,
};
