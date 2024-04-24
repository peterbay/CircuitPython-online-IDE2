import MarkdownExtended from "./MarkdownExtended";
import keyboardShortcuts from "../assets/markdown/keyboardShortcuts.md";

export default function KeyboardShortcuts() {
    return (
        <MarkdownExtended
            className="keyboard-shortcuts"
        >
            {keyboardShortcuts}
        </MarkdownExtended>
    );
}
