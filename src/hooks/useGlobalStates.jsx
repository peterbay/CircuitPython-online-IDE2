import { useState } from "react";

export default function useGlobalStates() {
    const [states, setstates] = useState({});

    const setState = (key, value) => {
        setstates((prev) => {
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    return {
        states,
        setState,
    };
}
