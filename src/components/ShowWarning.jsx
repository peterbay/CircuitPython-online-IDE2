import PropTypes from "prop-types";
import HyperLink from "./HyperLink";
import WarningModal from "./WarningModal";

export default function ShowWarning({ isMobile = false, isNotChrome = false, isMac = false }) {
    return (
        <>
            {(isMobile && (
                <WarningModal title="Mobile devices are not supported!" closeEnabled={false}>
                    CircuitPython Online IDE is not supported on mobile devices. Please use Chrome, MS Edge, or other
                    Chromium-based browsers on a Windows PC, Mac or Chromebook. Check out
                    <HyperLink
                        text="this link"
                        link="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility"
                    />
                    for more information
                </WarningModal>
            )) ||
                (isNotChrome && (
                    <WarningModal title="Your Browser Is Not Supported!" closeEnabled={false}>
                        CircuitPython Online IDE only supports Chrome, MS Edge, or other Chromium-based browsers on a Windows PC,
                        Mac or Chromebook. Check out
                        <HyperLink
                            text="this link"
                            link="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility"
                        />
                        for more information
                    </WarningModal>
                )) ||
                (isMac && (
                    <WarningModal title="Warning for MacOS users!" closeEnabled={true}>
                        If you have issues writing files to microcontrollers, it is not a bug of the IDE or CircuitPython, but a
                        known issue of MacOS 14 (Sonoma). Please check
                        <HyperLink
                            text="this link"
                            link="https://github.com/adafruit/circuitpython/issues/8449#issuecomment-1743922060"
                        />
                        for a walkaround that temporary fix this issue.
                    </WarningModal>
                )
                )}
        </>
    );
}

ShowWarning.propTypes = {
    isMobile: PropTypes.bool,
    isNotChrome: PropTypes.bool,
    isMac: PropTypes.bool,
};
