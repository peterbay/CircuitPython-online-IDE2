import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material';
import TextFieldWithCopy from "./TextFieldWithCopy";
import camelCase from "lodash/camelCase";
import snakeCase from "lodash/snakeCase";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import lowerFirst from "lodash/lowerFirst";
import capitalize from "lodash/capitalize";
import startCase from "lodash/startCase";


export default function BaseConverter() {

    const [inputValue, setInputValue] = useState('');
    const [lowerCaseValue, setLowerCaseValue] = useState('');
    const [upperCaseValue, setUpperCaseValue] = useState('');
    const [kebabCaseValue, setKebabCaseValue] = useState('');
    const [snakeCaseValue, setSnakeCaseValue] = useState('');
    const [upperFirstValue, setUpperFirstValue] = useState('');
    const [lowerFirstValue, setLowerFirstValue] = useState('');
    const [camelCaseValue, setCamelCaseValue] = useState('');
    const [capitalizeValue, setCapitalizeValue] = useState('');
    const [startCaseValue, setStartCaseValue] = useState('');

    const changeInputValue = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setLowerCaseValue(value.toString().toLowerCase());
        setUpperCaseValue(value.toString().toUpperCase());
        setKebabCaseValue(kebabCase(value));
        setSnakeCaseValue(snakeCase(value));
        setUpperFirstValue(upperFirst(value));
        setLowerFirstValue(lowerFirst(value));
        setCamelCaseValue(camelCase(value));
        setCapitalizeValue(capitalize(value));
        setStartCaseValue(startCase(value));
    }

    return (
        <Card sx={{ maxWidth: 410 }} className="panel">
            <CardHeader
                title="Case Converter"
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
                            id="input-value"
                            value={inputValue}
                            onChange={changeInputValue}
                            label="Your string"
                        />

                        <TextFieldWithCopy
                            id="lower-case-value"
                            value={lowerCaseValue}
                            label="Lowercase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="upper-case-value"
                            value={upperCaseValue}
                            label="Uppercase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="camel-case-value"
                            value={camelCaseValue}
                            label="Camelcase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="capitalize-value"
                            value={capitalizeValue}
                            label="Capitalcase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="kebab-case-value"
                            value={kebabCaseValue}
                            label="Kebabcase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="snake-case-value"
                            value={snakeCaseValue}
                            label="Snakecase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="start-case-value"
                            value={startCaseValue}
                            label="Startcase"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="upper-first-value"
                            value={upperFirstValue}
                            label="Upperfirst"
                            disabled={true}
                        />

                        <TextFieldWithCopy
                            id="lower-first-value"
                            value={lowerFirstValue}
                            label="Lowerfirst"
                            disabled={true}
                        />
                    </div>
                </Box>
            </CardContent>
        </Card>
    );
}
