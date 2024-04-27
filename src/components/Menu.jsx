import PropTypes from "prop-types";
import { useState, useRef, useEffect, useContext } from "react";
import {
    Button,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
} from "@mui/material";

import IdeContext from "../contexts/IdeContext";
export default function Menu({ label, options }) {

    const { themeApi } = useContext(IdeContext);
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const prevOpen = useRef(open);

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
    useEffect(() => {
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
                sx={{
                    color: themeApi.isDarkMode ? "#bbb" : "#333",
                    fontWeight: "400",
                }}
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
                sx={{
                    zIndex: 200,
                }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
                        }}
                    >
                        <Paper
                            sx={{
                                borderRadius: "0px",
                                padding: "2px",
                                backgroundColor: themeApi.isDarkMode ? "#131313" : "#fff",
                                '& li': {
                                    color: themeApi.isDarkMode ? '#ccc' : '#888',
                                },
                                '& li:hover': {
                                    backgroundColor: themeApi.isDarkMode ? 'rgb(26, 56, 95)' : 'rgb(65, 117, 212)',
                                    color: 'white !important',
                                }
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={open}
                                    id="composition-menu"
                                    aria-labelledby="composition-button"
                                    onKeyDown={handleListKeyDown}
                                    sx={{
                                        padding: "0px",
                                    }}
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

Menu.propTypes = {
    label: PropTypes.string,
    options: PropTypes.array,
};
