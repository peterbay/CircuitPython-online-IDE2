import MarkdownExtended from "./MarkdownExtended";
import aboutMarkdown from "../assets/markdown/about.md";

export default function About() {
    return (
        <MarkdownExtended>{aboutMarkdown}</MarkdownExtended>
    );
}
