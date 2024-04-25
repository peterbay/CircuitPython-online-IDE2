import PropTypes from "prop-types";

import {
    Tooltip,
} from "@mui/material";

export default function ButtonSvg({ path, polygon, onClick, tooltip, isLast = false }) {
    return (
        <Tooltip
            title={tooltip}
            placement="left"
        >
            <div
                onClick={onClick}
                style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    height: 40,
                    width: 40,
                    border: '2px solid #ccc',
                    borderBottom: isLast ? '2px solid #ccc' : 'none',
                }}
            >
                <svg
                    style={{
                        height: '100%',
                        width: '100%',
                        padding: 10,
                        boxSizing: 'border-box',
                    }}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d={path}
                        stroke="#4C68C1"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    {polygon && (
                        <polygon
                            stroke="#4C68C1"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polygon}
                        />
                    )}
                </svg>
            </div>
        </Tooltip>
    );
}

ButtonSvg.propTypes = {
    path: PropTypes.string.isRequired,
    polygon: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    tooltip: PropTypes.string,
    isLast: PropTypes.bool,
};
