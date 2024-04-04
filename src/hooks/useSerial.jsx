import { useState } from "react";

import forEach from "lodash/forEach";

import SerialCommunication from "../utils/serial";

const serial = new SerialCommunication();

export default function useSerial({ statesApi, configApi }) {

    const [serialStatus, setSerialStatus] = useState(false);
    const [connectionState, setConnectionState] = useState("Not connected");
    const [onConnect, setOnConnect] = useState(null);
    const [terminal, setTerminal] = useState(null);

    const connect = async function () {
        const status = await serial.open();
        setSerialStatus(status);
        if (!status) {
            serial.close();
            setConnectionState("Failed to open serial port");
            console.error("Failed to open serial port");
            statesApi.setState('serial-connected', false);

        } else {
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
            "Ctrl+C": "\x03",
            "Ctrl+D": "\x04",
            "Ctrl+Z": "\x1A",
            "Ctrl+L": "\x0C",
            "Ctrl+R": "\x12",
            "Ctrl+T": "\x14",
            "Ctrl+U": "\x15",
            "Ctrl+W": "\x17",
            "Ctrl+Y": "\x19",
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
        serial,
        serialStatus,
        setOnConnect,
        onConnect,
        setTerminal,
        changeSettings,
    };
}
