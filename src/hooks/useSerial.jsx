import { useState } from "react";

import forEach from "lodash/forEach";

import SerialCommunication from "../utils/serial";

const serial = new SerialCommunication();

export default function useSerial({ statesApi, configApi, infoApi }) {

    const [serialStatus, setSerialStatus] = useState(false);
    const [connectionState, setConnectionState] = useState("Not connected");
    const [onConnect, setOnConnect] = useState(null);
    const [terminal, setTerminal] = useState(null);

    const connect = async function () {
        const status = await serial.open();
        setSerialStatus(status);
        if (!status) {
            serial.close();
            infoApi.errorMessage('Failed to open serial port.');
            setConnectionState("Failed to open serial port");
            console.error("Failed to open serial port");
            statesApi.setState('serial-connected', false);

        } else {
            infoApi.successMessage('Serial port opened');
            setConnectionState("Connected");
            statesApi.setState('serial-initialized', true);
            statesApi.setState('serial-connected', true);

            if (onConnect) {
                onConnect();
            }
        }
    };

    const disconnect = function () {
        serial.close();
        setSerialStatus(false);
        setConnectionState("Disconnected");
        infoApi.successMessage('Serial port closed.');
    };

    const clearTerminal = function () {
        if (!terminal) {
            return;
        }
        terminal.clear();
    };

    const sendKey = function (key) {
        if (!serialStatus) {
            return;
        }

        const keys = {
            "Ctrl+A": "\x01",
            "Ctrl+B": "\x02",
            "Ctrl+C": "\x03",
            "Ctrl+D": "\x04",
            "Ctrl+E": "\x05",
            "Ctrl+F": "\x06",
            "Ctrl+G": "\x07",
            "Ctrl+H": "\x08",
            "Ctrl+I": "\x09",
            "Ctrl+J": "\x0A",
            "Ctrl+K": "\x0B",
            "Ctrl+L": "\x0C",
            "Ctrl+M": "\x0D",
            "Ctrl+N": "\x0E",
            "Ctrl+O": "\x0F",
            "Ctrl+P": "\x10",
            "Ctrl+Q": "\x11",
            "Ctrl+R": "\x12",
            "Ctrl+S": "\x13",
            "Ctrl+T": "\x14",
            "Ctrl+U": "\x15",
            "Ctrl+V": "\x16",
            "Ctrl+W": "\x17",
            "Ctrl+X": "\x18",
            "Ctrl+Y": "\x19",
            "Ctrl+Z": "\x1A",
        };

        if (keys[key]) {
            serial.write(keys[key]);
        }
    };

    const sendKeys = function (keys) {
        if (!serialStatus) {
            return;
        }
        forEach(keys, (key) => {
            sendKey(key);
        });
    };

    const write = function (data) {
        if (!serialStatus) {
            return;
        }

        serial.write(data);
    }

    const changeSettings = function (type) {
        if (type === 'font-size-increase') {
            const actualValue = configApi.getConfigField('serial_console', 'font_size');
            if (actualValue < 48) {
                configApi.setConfigField('serial_console', 'font_size', actualValue + 1);
            }

        } else if (type === 'font-size-decrease') {
            const actualValue = configApi.getConfigField('serial_console', 'font_size');
            if (actualValue > 6) {
                configApi.setConfigField('serial_console', 'font_size', actualValue - 1);
            }

        }
    }

    return {
        clearTerminal,
        connect,
        connectionState,
        disconnect,
        sendKey,
        sendKeys,
        write,
        serial,
        serialStatus,
        setOnConnect,
        onConnect,
        setTerminal,
        changeSettings,
    };
}
