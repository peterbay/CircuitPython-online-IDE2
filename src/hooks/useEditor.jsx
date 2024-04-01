import { useState } from "react";
import { Range } from "ace-builds";

import camelCase from "lodash/camelCase";
import snakeCase from "lodash/snakeCase";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import lowerFirst from "lodash/lowerFirst";
import capitalize from "lodash/capitalize";
import startCase from "lodash/startCase";

function sortComparer(a,b){
    return a?.localeCompare(b) || 0;
}

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

export default function useEditor() {

    const [activeEditorNode, setActiveEditorNode] = useState(null);
    const [editorAction, setEditorAction] = useState(null);

    const transformText = function (type) {
        if (!activeEditorNode) {
            return;
        }

        setEditorAction(type);
    };

    const applyTransform = function (editor, type) {
        const session = editor?.session;

        const selectionRange = session.getSelection().getRange();
        const textRange = session.getTextRange(selectionRange);
        const newLineCharacter = session.doc.getNewLineCharacter();

        if (!textRange || !textRange.length) {
            return;
        }

        // console.log("editorAction", type);
        // console.log("textRange", textRange);
        let newText = textRange;

        try {

            if (type === "uppercase") {
                newText = textRange.toUpperCase();

            } else if (type === "lowercase") {
                newText = textRange.toLowerCase();

            } else if (type === "camelcase") {
                newText = camelCase(textRange);

            } else if (type === "kebabcase") {
                newText = kebabCase(textRange);

            } else if (type === "snakecase") {
                newText = snakeCase(textRange);

            } else if (type === "upperfirst") {
                newText = upperFirst(textRange);

            } else if (type === "lowerfirst") {
                newText = lowerFirst(textRange);

            } else if (type === "capitalize") {
                newText = capitalize(textRange);

            } else if (type === "startcase") {
                newText = startCase(textRange);

            } else if (type === "sort-ascending") {
                const lines = textRange.split(newLineCharacter);
                newText = lines.sort(sortComparer).join(newLineCharacter);

            } else if (type === "sort-descending") {
                const lines = textRange.split(newLineCharacter);
                newText = lines.sort(sortComparer).reverse().join(newLineCharacter);

            } else if (type === "convert-dec-to-hex") {
                newText = baseConverter(10, 16, textRange);

            } else if (type === "convert-dec-to-bin") {
                newText = baseConverter(10, 2, textRange);

            } else if (type === "convert-hex-to-dec") {
                newText = baseConverter(16, 10, textRange);

            } else if (type === "convert-hex-to-bin") {
                newText = baseConverter(16, 2, textRange);

            } else if (type === "convert-bin-to-dec") {
                newText = baseConverter(2, 10, textRange);

            } else if (type === "convert-bin-to-hex") {
                newText = baseConverter(2, 16, textRange);

            }
        } catch (error) {
            console.error(`[useEditor] (applyTransform) ${error}`);
            return;
        }

        session.replace(selectionRange, newText);

        // console.log("newText", newText);

        const startRow = selectionRange.start.row;
        const startColumn = selectionRange.start.column;

        const newTextLines = newText.split("\n");
        const endRow = startRow + newTextLines.length - 1;
        const endColumn = (newTextLines.length === 1 ? startColumn : 0) + newTextLines[newTextLines.length - 1].length;

        const newRange = new Range(startRow, startColumn, endRow, endColumn);
        editor.getSelection().setSelectionRange(newRange, false);
    };

    return {
        activeEditorNode,
        applyTransform,
        editorAction,
        setActiveEditorNode,
        setEditorAction,
        transformText,
    };
}
