import PropTypes from "prop-types";

import { useEffect, useState, forwardRef } from "react";

import { styled } from '@mui/material/styles';

import {
    Box,
    Divider,
    Toolbar,
    Typography,
    IconButton,
    Paper,
    InputBase,

} from '@mui/material';

import {
    Close as CloseIcon,
} from '@mui/icons-material';

import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import { unstable_useTreeItem2 as useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import {
    TreeItem2Content,
    TreeItem2IconContainer,
    TreeItem2GroupTransition,
    TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';

import { Python3Parser, lexer } from 'dt-python-parser';
import reduce from 'lodash/reduce';
import { useDebounce } from "use-debounce";

const parser = new Python3Parser();

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
    padding: theme.spacing(0.2, 1),
}));

const CustomTreeItem = forwardRef(function CustomTreeItem(props, ref) {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
        getRootProps,
        getContentProps,
        getIconContainerProps,
        getLabelProps,
        getGroupTransitionProps,
        status,
    } = useTreeItem2({
        id,
        itemId,
        children,
        label,
        disabled,
        rootRef: ref,
    });

    const labelProps = getLabelProps();

    return (
        <TreeItem2Provider itemId={itemId}>
            <TreeItem2Root {...getRootProps(other)}>
                <CustomTreeItemContent {...getContentProps()}>
                    <TreeItem2IconContainer {...getIconContainerProps()}>
                        <TreeItem2Icon status={status} />
                    </TreeItem2IconContainer>
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, width: '100%' }}>
                        <div
                            style={{
                                width: '100%',
                            }}
                            dangerouslySetInnerHTML={{
                                __html: labelProps?.children || '',
                            }}
                        />
                    </Box>
                </CustomTreeItemContent>
                {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
            </TreeItem2Root>
        </TreeItem2Provider>
    );
});

const highlightCodePart = (code, token) => {
    const start = token.start;
    const stop = token.stop;
    const offsetStart = (start < 50) ? start : start - 50;
    const offsetStop = ((stop + 50) < code.length) ? 50 : code.length - stop;

    let pre = code.substring(start - offsetStart, start);
    let post = code.substring(stop + 1, stop + offsetStop);

    if (pre.indexOf('\n') !== -1) {
        pre = pre.substring(pre.lastIndexOf('\n') + 1);
    }

    const postEndOfLine = post.indexOf('\n');
    if (postEndOfLine !== -1) {
        post = post.substring(0, postEndOfLine);
    }

    return `<code>${pre}</code><code class="code-highlight">${token.text}</code><code>${post}</code>`;
};

const prepareLabel = (code, token) => {
    if (token.type === 'Comment') {
        return `<small><code>${token.lineNumber}.</code></small> <code class="comment">${token.value}</code>`;
    }
    return `<small><code>${token.line || token.lineNumber}.</code></small> ${highlightCodePart(code, token)}`;
};

export default function CodeExplorer({ code, goToLine, height }) {

    const [treeContent, setTreeContent] = useState([]);
    const [idToLine, setIdToLine] = useState({});
    const [filterValue, setFilterValue] = useState('');
    const [debouncedFilterValue] = useDebounce(filterValue, 300);

    useEffect(() => {
        onCodeChange(code, debouncedFilterValue);
    }, [code, debouncedFilterValue]);

    function onCodeChange(actualCode, actualFilterValue) {
        const tokens = parser.getAllTokens(actualCode);
        const names = {};
        const ids = {};

        const filterRegex = new RegExp(`.*${actualFilterValue}.*`, 'i');

        const info = reduce(tokens, (acc, token) => {
            if (actualFilterValue && !token.text.match(filterRegex)) {
                return acc;
            }

            // Python3Parser.IMPORT = 5;
            if (token.type === 5) {
                if (!acc.imports) {
                    acc.imports = {
                        id: 'imports',
                        label: 'Imports',
                        children: [],
                    };
                }
                const id = `import-${token.line}`;
                ids[id] = token.line;

                acc.imports.children.push({
                    id,
                    label: prepareLabel(actualCode, token),
                    line: token.line,
                });

                // Python3Parser.CLASS = 28;
            } else if (token.type === 28) {
                if (!acc.class) {
                    acc.class = {
                        id: 'classes',
                        label: 'Classes',
                        children: [],
                    };
                }
                const id = `class-${token.line}`;
                ids[id] = token.line;

                acc.class.children.push({
                    id,
                    label: prepareLabel(actualCode, token),
                    line: token.line,
                });

                // Python3Parser.NAME = 37;
            } else if (token.type === 37) {
                if (!acc.names) {
                    acc.names = {
                        id: 'names',
                        label: 'Names',
                        children: [],
                    };
                }

                let index = 0;
                if (names[token.text] === undefined) {
                    index = acc.names.children.length;
                    names[token.text] = index;
                    acc.names.children.push({
                        id: `name-${token.text}`,
                        label: `${token.text}`,
                        children: []
                    });
                } else {
                    index = names[token.text];
                }

                const id = `name-${token.text}-${token.line}-${token.start}`;
                ids[id] = token.line;

                acc.names.children[index].children.push({
                    id,
                    label: prepareLabel(actualCode, token),
                    line: token.line,
                });
            }
            return acc;
        }, {});

        const tree = [];
        if (info.imports) {
            tree.push(info.imports);
        }

        if (info.class) {
            tree.push(info.class);
        }

        if (info.names) {
            info.names.children = info.names.children.sort((a, b) => a.label.localeCompare(b.label));
            tree.push(info.names);
        }

        const lexers = lexer(code);

        const lexerInfo = reduce(lexers, (acc, token) => {

            if (actualFilterValue && !token.value.match(filterRegex)) {
                return acc;
            }

            if (token.type === 'Comment') {
                if (!acc.comments) {
                    acc.comments = {
                        id: 'comments',
                        label: 'Comments',
                        children: [],
                    };
                }
                const id = `comments-${token.lineNumber}`;
                ids[id] = token.lineNumber;

                acc.comments.children.push({
                    id,
                    label: prepareLabel(code, token),
                    line: token.lineNumber,
                });
            }
            return acc;
        }, {});

        if (lexerInfo.comments) {
            tree.push(lexerInfo.comments);
        }

        setIdToLine(ids);
        setTreeContent(tree);
    }

    return (
        <>
            <div
                style={{
                    height: `${height}px`,
                    width: "100%",
                    maxHeight: `${height}px`,
                    maxWidth: `${height}px`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        flexGrow: 0,
                        height: "80px",
                    }}
                >
                    <Toolbar
                        variant="dense"
                        sx={{ minHeight: "35px" }}
                    >
                        <Typography>Code Explorer</Typography>
                    </Toolbar>
                    <Divider />
                    <Paper
                        component="form"
                        sx={{
                            p: '0px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            height: '35px',
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <InputBase
                            sx={{
                                ml: 1,
                                flex: 1,
                                padding: '0px !important',
                            }}
                            placeholder="Filter"
                            inputProps={{
                                'aria-label': 'filter',
                                style: {
                                    padding: '0px !important',
                                },
                            }}
                            value={filterValue}
                            onChange={(event) => setFilterValue(event.target.value)}
                        />
                        <IconButton
                            sx={{
                                p: '10px',
                                opacity: 0.5,
                                borderRadius: 0
                            }}
                            aria-label="directions"
                            size="small"
                            edge="start"
                            onClick={() => setFilterValue('')}
                        >
                            <CloseIcon
                                fontSize="inherit"
                            />
                        </IconButton>
                    </Paper>
                    <Divider />
                </div>
                <div
                    style={{
                        flexGrow: 1,
                        overflow: "auto",
                        height: "calc(100% - 40px)",
                    }}
                >
                    <RichTreeView
                        items={treeContent}
                        onSelectedItemsChange={(event, id) => {
                            if (id && idToLine[id] !== undefined) {
                                goToLine(idToLine[id]);
                            }
                        }}
                        slots={{
                            item: CustomTreeItem,
                            root: Box,
                        }}
                    />
                </div>
            </div>
        </>
    );
}

CodeExplorer.propTypes = {
    code: PropTypes.string,
    goToLine: PropTypes.func,
    height: PropTypes.number,
};

CustomTreeItem.propTypes = {
    id: PropTypes.string,
    itemId: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.array,
};
