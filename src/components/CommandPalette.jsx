import { useState, useEffect, useContext, useRef } from "react";
import {
    Dialog,
    DialogContent,
    TextField,
    Autocomplete,
} from "@mui/material";

import { useHotkeys } from 'react-hotkeys-hook'

import IdeContext from "../contexts/IdeContext";
import get from "lodash/get";

export default function CommandPaletteDialog() {

    const context = useContext(IdeContext);

    const [dialogOpen, setDialogOpen] = useState(false);
    const autocompleteRef = useRef(null);
    const autocompleteValue = useRef(null);

    useHotkeys('ctrl+shift+q', () => {
        autocompleteValue.current = null;
        setDialogOpen(true);
    }, {
        preventDefault: true,
    });

    useEffect(() => {
        if (context.paletteApi.open) {
            autocompleteValue.current = null;
            setDialogOpen(true);
            context.paletteApi.setOpen(false);

            setTimeout(() => {
                autocompleteRef?.current?.focus();
            }, 100);
        }
    }, [context.paletteApi, autocompleteValue]);

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleDialogClose();
        }
    };

    const onAutoCompleteChange = async (e, value) => {
        handleDialogClose();
        if (!value?.handler) {
            return;
        }

        const handler = [...value.handler];
        const handlerPath = handler.shift() || null;
        const handlerParams = handler || [];

        const handlerFunction = get(context, handlerPath);
        if (!handlerFunction) {
            console.error('(onAutoCompleteChange) handler not found', handlerPath);
            return;
        }

        context.paletteApi.usePaletteEntry(value);

        try {
            await handlerFunction(...handlerParams);
        } catch (e) {
            console.error(`(onAutoCompleteChange) handler error - path: ${handlerPath}, params: [${handlerParams.join(', ')}]`, e);
        }
    }

    return (
        <>
            <Dialog
                open={dialogOpen && context?.paletteApi?.paletteList?.length > 0}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent
                    sx={{
                        width: "500px",
                        height: '450px',
                        maxHeight: '450px !important',
                        overflow: 'hidden',
                        padding: '0px',
                    }}
                >
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={context?.paletteApi?.paletteList}
                        sx={{
                            maxHeight: 300,
                            width: '100%',
                            '& .MuiInputBase-input': {
                                paddingTop: '4px !important',
                                paddingBottom: '4px !important',
                            },
                            '& .MuiFormControl-root': {
                                marginTop: '0px !important',
                                marginBottom: '0px !important',
                            },
                        }}
                        ListboxProps={
                            {
                                style: {
                                    maxHeight: '400px',
                                    fontWeight: 300,
                                },
                                sx: {
                                    '& li.Mui-focused': {
                                        backgroundColor: '#6080bb !important',
                                        color: 'white !important',
                                    }
                                },
                            }
                        }
                        renderOption={(props, option) => {
                            props.style = {
                                borderTop: option.others ? '2px solid #888' : 'none',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            };
                            props.key = `${option.used ? 'used' : 'not-used'}-${option.cmdId}`;
                            return (
                                <li {...props}>
                                    <span style={{ float: 'left' }} >{option.label}</span>
                                    <span style={{ float: 'right', fontSize: '12px' }}>
                                        {option.recentlyUsed && '(recently used)'}
                                        {option.others && '(other commands)'}
                                    </span>
                                </li>
                            );
                        }}
                        renderInput={(params) => {
                            return <TextField
                                {...params}
                                inputRef={autocompleteRef}
                                autoFocus={true}
                                onKeyDown={onKeyDown}
                            />
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return option.cmdId === value.cmdId && option.used === value.used;
                        }}
                        size="small"
                        margin="dense"
                        open={true}
                        autoHighlight={true}
                        fullWidth={true}
                        onChange={onAutoCompleteChange}
                        value={autocompleteValue.current}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
