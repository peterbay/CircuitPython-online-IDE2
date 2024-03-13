import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material';
import TextFieldWithCopy from "./TextFieldWithCopy";

const baseConverter = (fromBase, toBase, value) => {

    if ((fromBase === 10 && !value.match(/^[0-9]*$/)) ||
        (fromBase === 8 && !value.match(/^[0-7]*$/)) ||
        (fromBase === 2 && !value.match(/^[0-1]*$/)) ||
        (fromBase === 16 && !value.match(/^[0-9a-fA-F]*$/))
    ) {
        throw new Error(`Invalid value - fromBase: ${fromBase}, toBase: ${toBase}, value: ${value}`);
    }

    const toValue = parseInt(value, fromBase).toString(toBase);
    if (toBase !== 16 && isNaN(toValue)) {
        throw new Error(`Invalid value - fromBase: ${fromBase}, toBase: ${toBase}, value: ${value}`);
    }
    return toValue;
}

export default function BaseConverter() {

    const [decimalValue, setDecimalValue] = useState(0);
    const [hexadecimalValue, setHexadecimalValue] = useState(0);
    const [binaryValue, setBinaryValue] = useState(0);
    const [octalValue, setOctalValue] = useState(0);

    const [decimalIncorrect, setDecimalIncorrect] = useState(false);
    const [hexadecimalIncorrect, setHexadecimalIncorrect] = useState(false);
    const [binaryIncorrect, setBinaryIncorrect] = useState(false);
    const [octalIncorrect, setOctalIncorrect] = useState(false);

    const setAllCorrect = () => {
        setDecimalIncorrect(false);
        setHexadecimalIncorrect(false);
        setBinaryIncorrect(false);
        setOctalIncorrect(false);
    };

    const changeDecimalValue = (e) => {
        const value = e.target.value;
        setDecimalValue(value);
        try {
            setHexadecimalValue(baseConverter(10, 16, value));
            setBinaryValue(baseConverter(10, 2, value));
            setOctalValue(baseConverter(10, 8, value));

            setAllCorrect();
        } catch (error) {
            setDecimalIncorrect(true);
            return;
        }
    }

    const changeHexadecimalValue = (e) => {
        const value = e.target.value;
        setHexadecimalValue(value);
        try {
            setDecimalValue(baseConverter(16, 10, value));
            setBinaryValue(baseConverter(16, 2, value));
            setOctalValue(baseConverter(16, 8, value));

            setAllCorrect();
        } catch (error) {
            setHexadecimalIncorrect(true);
            return;
        }
    }

    const changeBinaryValue = (e) => {
        const value = e.target.value;
        setBinaryValue(value);
        try {
            setDecimalValue(baseConverter(2, 10, value));
            setHexadecimalValue(baseConverter(2, 16, value));
            setOctalValue(baseConverter(2, 8, value));

            setAllCorrect();
        } catch (error) {
            setBinaryIncorrect(true);
            return;
        }
    }

    const changeOctalValue = (e) => {
        const value = e.target.value;
        setOctalValue(value);
        try {
            setDecimalValue(baseConverter(8, 10, value));
            setHexadecimalValue(baseConverter(8, 16, value));
            setBinaryValue(baseConverter(8, 2, value));

            setAllCorrect();
        } catch (error) {
            setOctalIncorrect(true);
            return;
        }
    }

    return (
        <Card sx={{ maxWidth: 410 }} className="panel">
            <CardHeader
                title="Base Converter"
                sx={{ fontSize: "16px", paddingBottom: "0px" }}
            />
            <CardContent>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '40ch' },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <div>
                        <TextFieldWithCopy
                            id="decimal-value"
                            value={decimalValue}
                            onChange={changeDecimalValue}
                            label="Decimal"
                            error={decimalIncorrect}
                            errorLabel="Incorrect decimal value"
                        />

                        <TextFieldWithCopy
                            id="hexadecimal-value"
                            value={hexadecimalValue}
                            onChange={changeHexadecimalValue}
                            label="Hexadecimal"
                            error={hexadecimalIncorrect}
                            errorLabel="Incorrect hexadecimal value"
                        />

                        <TextFieldWithCopy
                            id="binary-value"
                            value={binaryValue}
                            onChange={changeBinaryValue}
                            label="Binary"
                            error={binaryIncorrect}
                            errorLabel="Incorrect binary value"
                        />

                        <TextFieldWithCopy
                            id="binary-value"
                            value={octalValue}
                            onChange={changeOctalValue}
                            label="Octal"
                            error={octalIncorrect}
                            errorLabel="Incorrect octal value"
                        />
                    </div>
                </Box>
            </CardContent>
        </Card>
    );
}
