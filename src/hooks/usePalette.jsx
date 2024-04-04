import { useState, useEffect, useCallback } from "react";
import get from "lodash/get";
import every from "lodash/every";
import sortBy from "lodash/sortBy";
import commandPaletteEntries from "../settings/commandPaletteEntries.json";
import themes from '../settings/themesSettings';

export default function usePalette({ statesApi }) {
    const [paletteEntries, setPaletteEntries] = useState([]);
    const [paletteList, setPaletteList] = useState([]);
    const [usedPaletteList, setUsedPaletteList] = useState([]);
    const [open, setOpen] = useState(false);

    const preparePaletteEntries = useCallback(() => {
        const entries = paletteEntries.filter((entry) => {
            if (entry.dependency) {
                return every(entry.dependency, (dep) => {
                    if (dep.startsWith('!')) {
                        return !get(statesApi.states, dep.slice(1));
                    }
                    return get(statesApi.states, dep, false);
                });
            }
            return true;
        });

        const sortedEntries = sortBy(entries, ['label']);
        sortedEntries.forEach((entry, index) => {
            entry.others = (index === 0);
        });

        setPaletteList(usedPaletteList.concat(sortedEntries));
    }, [paletteEntries, statesApi.states, usedPaletteList]);

    useEffect(() => {
        preparePaletteEntries();
    }, [statesApi.states, paletteEntries, usedPaletteList, preparePaletteEntries]);

    function addPaletteEntry(entry) {
        if (paletteEntries.find((e) => e.cmdId === entry.cmdId)) {
            return;
        }
        setPaletteEntries((prev) => {
            return [
                ...prev,
                entry,
            ];
        });
    }

    function usePaletteEntry(entry) {
        setUsedPaletteList((prev) => {

            if (prev.find((e) => e.cmdId === entry.cmdId)) {
                prev = prev.filter((e) => e.cmdId !== entry.cmdId);
            }

            prev.forEach((e) => {
                e.recentlyUsed = false;
            });

            const newEntry = { ...entry };
            newEntry.recentlyUsed = true;
            newEntry.used = true;
            newEntry.others = false;
            newEntry.date = new Date().getTime();

            prev.unshift(newEntry);
            if (prev.length > 5) {
                prev.pop();
            }
            prev.forEach((e, index) => {
                e.prefix = index + 1;
            });
            return prev;
        });
        preparePaletteEntries();
    }

    function registerCommandPaletteEntries() {
        commandPaletteEntries.forEach((entry) => {
            addPaletteEntry(entry);
        });

        themes.themes.forEach((theme) => {
            addPaletteEntry({
                cmdId: `theme-${theme.name}`,
                label: `Theme - ${theme.label}`,
                handler: ["configApi.setTheme", theme.label],
                dependency: [],
            });
        });
    }

    registerCommandPaletteEntries();

    return {
        addPaletteEntry,
        paletteList,
        usePaletteEntry,
        setOpen,
        open,
    };
}
