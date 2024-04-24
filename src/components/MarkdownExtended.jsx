import PropTypes from "prop-types";
import { createElement } from 'react';
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'

const defaultOverrides = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    p: 'p',
    a: 'a',
    ul: 'ul',
    li: 'li',
};

const components = Object.keys(defaultOverrides).reduce((acc, tag) => {
    const Component = defaultOverrides[tag];
    acc[tag] = ({ node, ...props }) => {
        const extendedProps = {
            'data-line': node.position.start.line,
        }

        if (tag === 'a' && props.href.startsWith("http")) {
            extendedProps.target = "_blank";
            extendedProps.rel = "noreferrer";
        }

        return createElement(Component, {
            ...props,
            ...extendedProps,
        });
    };
    return acc;
}, {});

export default function MarkdownExtended({ children, ...props }) {
    return (
        <Markdown
            className={`markdown-body ${props.className || ''}`}
            remarkPlugins={[remarkGfm]}
            components={components}
        >{children}</Markdown>
    );
}

MarkdownExtended.propTypes = {
    children: PropTypes.elementType,
    className: PropTypes.string,
};
