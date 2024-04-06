import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";

import {
    Box,
    Divider,
    Toolbar,
} from "@mui/material";

import ToolbarEntry from "./ToolbarEntry";

import { PanViewer } from "react-image-pan-zoom-rotate";

function ButtonSvg({ path, polygon, onClick, isLast = false }) {
    return (
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
    );
}

export default function ImageViewer({ fileHandle, node }) {

    const [fileIsLoaded, setFileIsLoaded] = useState(false);
    const width = node.getRect().width;
    const height = node.getRect().height;
    const [imageSrc, setImageSrc] = useState(null);
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const imageRef = useRef(null);
    const [dx, setDx] = useState(0);
    const [dy, setDy] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState(false);

    const resetAll = () => {
        setDx(0);
        setDy(0);
        setZoom(1);
        setRotation(0);
        setFlip(false);
    };
    const zoomIn = () => {
        setZoom(zoom + 0.2);
    };

    const zoomOut = () => {
        if (zoom >= 1) {
            setZoom(zoom - 0.2);
        }
    };

    const rotateLeft = () => {
        if (rotation === -3) {
            setRotation(0);
        } else {
            setRotation(rotation - 1);
        }
    };

    const flipImage = () => {
        setFlip(!flip);
    };

    const onPan = (dx, dy) => {
        setDx(dx);
        setDy(dy);
    };

    const onLoad = () => {
        setImageWidth(imageRef.current.width);
        setImageHeight(imageRef.current.height);
    };

    useEffect(() => {
        async function loadContent() {
            const reader = new FileReader();
            reader.onload = function (e) {
                setImageSrc(e.target.result);
            };
            const file = await fileHandle.getFile();
            reader.readAsDataURL(file);

            setFileIsLoaded(true);
        }
        if (imageRef.current && fileHandle && !fileIsLoaded) {
            loadContent();
        }
    }, [fileHandle, imageRef, fileIsLoaded]);

    return (
        <>
            <Box sx={{
                flexGrow: 1,
                flexDirection: 'row',
                display: 'flex',
                height: "calc(" + height + "px - 38px)",
                maxHeight: "calc(" + height + "px - 38px)",
                overflow: 'hidden',
            }}>
                <div>
                    <div
                        style={{
                            position: 'absolute',
                            right: '10px',
                            zIndex: 2,
                            top: 10,
                            userSelect: 'none',
                            borderRadius: 2,
                            background: '#fff',
                            boxShadow: '0px 2px 6px rgba(53, 67, 93, 0.32)',
                        }}
                    >
                        <ButtonSvg
                            path="M4 12H20 M12 4L12 20"
                            onClick={zoomIn}
                        />
                        <ButtonSvg
                            path="M4 12H20"
                            onClick={zoomOut}
                        />
                        <ButtonSvg
                            path="M14 15L9 20L4 15 M20 4H13C10.7909 4 9 5.79086 9 8V20"
                            onClick={rotateLeft}
                        />
                        <ButtonSvg
                            path="M9.178,18.799V1.763L0,18.799H9.178z M8.517,18.136h-7.41l7.41-13.752V18.136z"
                            polygon="11.385,1.763 11.385,18.799 20.562,18.799"
                            onClick={flipImage}
                        />
                        <ButtonSvg
                            path="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                            onClick={resetAll}
                            isLast={true}
                        />
                    </div>

                    <PanViewer
                        style={{
                            width: width,
                            height: `${height - 38}px`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1,
                        }}
                        zoom={zoom}
                        setZoom={setZoom}
                        pandx={dx}
                        pandy={dy}
                        onPan={onPan}
                        rotation={rotation}
                        key={dx}
                    >
                        <img
                            style={{
                                transform: `rotate(${rotation * 90}deg) scaleX(${flip ? -1 : 1})`,
                                width: '100%',
                            }}
                            ref={imageRef}
                            alt={fileHandle.name}
                            src={imageSrc}
                            onLoad={onLoad}
                        />
                    </PanViewer>
                </div>
            </Box>
            <Box sx={{ flexGrow: 0, maxHeight: "35px" }}>
                <Divider />
                <Toolbar
                    variant="dense"
                    disableGutters={true}
                    sx={{ minHeight: "35px", maxHeight: "35px" }}
                >
                    <ToolbarEntry>Dimensions: {imageWidth}x{imageHeight}</ToolbarEntry>
                </Toolbar>
            </Box>
        </>
    );
}

ImageViewer.propTypes = {
    fileHandle: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    isNewFile: PropTypes.bool,
};

ButtonSvg.propTypes = {
    path: PropTypes.string.isRequired,
    polygon: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    isLast: PropTypes.bool,
};
