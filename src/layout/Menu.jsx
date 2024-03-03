import * as React from "react";

import {
    Button,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Stack,
} from "@mui/material";

import {
    deepPurple,
} from "@mui/material/colors";

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

function Menu({ label, options }) {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    function handleListKeyDown(event) {
        if (event.key === "Tab") {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === "Escape") {
            setOpen(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return (
        <>
            <Button
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? "composition-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
            >
                {label}
            </Button>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
                style={{ zIndex: 200 }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={open}
                                    id="composition-menu"
                                    aria-labelledby="composition-button"
                                    onKeyDown={handleListKeyDown}
                                >
                                    {options.map((opt) => (
                                        <MenuItem
                                            onClick={(event) => {
                                                handleClose(event);
                                                opt.handler();
                                            }}
                                            key={"item_key_" + opt.text}
                                        >
                                            {opt.text}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}
