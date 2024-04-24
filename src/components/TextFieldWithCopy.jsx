import PropTypes from "prop-types";
import {
    OutlinedInput,
    InputAdornment,
    FormControl,
    InputLabel,
    FormHelperText
} from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import TooltipIconButton from "./TooltipIconButton";
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';

export default function TextFieldWithCopy({ id, value, onChange, label, error = null, errorLabel = null, disabled = false }) {
    return (
        <FormControl sx={{ m: 1, width: '40ch' }} variant="outlined">
            <InputLabel
                htmlFor={id}
                error={error}
                sx={{
                    transform: "translate(14px, -9px) scale(.75)",
                }}
            >
                {label}
            </InputLabel>
            <OutlinedInput
                id={id}
                value={value}
                onChange={onChange}
                label={label}
                size="small"
                disabled={disabled}
                notched={true}
                endAdornment={
                    <InputAdornment position="end">
                        <CopyToClipboard text={value}>
                            <TooltipIconButton
                                id="decimal-copy"
                                title="Copy to clipboard"
                                icon={ContentCopyIcon}
                                iconSx={{ width: `16px`, height: `16px` }}
                            />
                        </CopyToClipboard>
                    </InputAdornment>
                }
            />
            <FormHelperText id={id}>{error ? errorLabel : ""}</FormHelperText>
        </FormControl>
    );
}

TextFieldWithCopy.propTypes = {
    id: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func,
    label: PropTypes.string,
    error: PropTypes.bool,
    errorLabel: PropTypes.string,
    disabled: PropTypes.bool,
};
