import { useState, useRef, createContext, useContext, useEffect } from "react";
// import { Subject } from 'rxjs'
import { dataSubscriber, dataService } from "../dataService";

import { Widget } from "./Widget";

import ApexCharts from 'apexcharts';

import widgetsSettings from "./widgetsSettings";

export const dashboardContent = () => {
    const [dashboardLayout, setDashboardLayout] = useState([]);
    const [widgets, setWidgets] = useState({});
    const lineBuffer = useRef("");
    const index = useRef(0);
    const dashboardData = useRef({});

    const registerWidget = function (options) {
        index.current += 1;

        const prevWidget = dashboardLayout.filter((item) => item.widgetOptions.id !== options.id);
        const newX = prevWidget.length ? (prevWidget[prevWidget.length - 1].x + prevWidget[prevWidget.length - 1].w) : 0;

        const widgetSettings = widgetsSettings[options.type];
        const widget = widgetSettings.widget;
        const chart = widgetSettings.chart;

        widget.i = `widget-${index.current}`;
        widget.x = newX;
        widget.y = Infinity;
        widget.widgetOptions = options;

        setDashboardLayout((prev) => {
            const exists = prev.filter((item) => item.widgetOptions.id === options.id);

            if (exists.length) {
                return prev;
            }

            return [
                ...prev,
                widget
            ];
        });

        const widgetHeight = widget.h * 40 + (widget.h - 1) * 10 - 10;
        chart.options.chart.id = `chart-${options.id}`;
        if (options.categories) {
            chart.options.xaxis.categories = options.categories;
        }

        setWidgets((prev) => {
            return {
                ...prev,
                [widget.i]: {
                    widgetOptions: options,
                    chartOptions: chart,
                    chartType: widgetSettings.type,
                    widget: (
                        <Widget
                            widgetOptions={options}
                            chartOptions={chart}
                            height={widgetHeight}
                            type={widgetSettings.type}
                        />
                    )
                }
            };
        });

        dashboardData.current[options.id] = [];
    };

    const processConfigData = function (data) {
        if (data.id && data.action) {
            if (data.action === "register") {
                if (!widgetsSettings[data.type]) {
                    console.error("Invalid widget type", data.type);
                    return;
                }
                registerWidget(data);
            }
        }
    };

    const processData = function (data) {
        const id = data[0];
        const rest = data.slice(1);
        dashboardData.current[id] = rest;
        dataService.send({
            id,
            data: rest
        });
    };

    const extractLineData = function (line) {
        if (line.startsWith("{") && line.endsWith("}")) {
            try {
                const data = JSON.parse(line);
                processConfigData(data);
            } catch (e) {
                // ignore
            }
        } else if (line.includes(";")) {
            const parts = line.split(";");
            processData(parts);
        }
    };

    const processLine = function (line) {
        lineBuffer.current += line;
        while (lineBuffer.current.includes("\n")) {
            const index = lineBuffer.current.indexOf("\n");
            const singleLine = lineBuffer.current.slice(0, index).trim();
            extractLineData(singleLine);
            lineBuffer.current = lineBuffer.current.slice(index + 1);
        }
    }

    const clearDashboard = function () {
        setDashboardLayout([]);
        setWidgets({});
        dashboardData.current = {};
    }

    const updateWidget = function (id, widget) {
        if (!widgets[id]) {
            console.error("Update widget - invalid widget id", id);
            return;
        } 

        const widgetHeight = widget.h * 40 + (widget.h - 1) * 10 - 10;
        const storedWidget = widgets[id];

        storedWidget.x = widget.x;
        storedWidget.y = widget.y;
        storedWidget.w = widget.w;
        storedWidget.h = widget.h;

        setWidgets((prev) => {
            return {
                ...prev,
                [widget.i]: {
                    widgetOptions: storedWidget.widgetOptions,
                    chartOptions: storedWidget.chartOptions,
                    chartType: storedWidget.chartType,
                    widget: (
                        <Widget
                            widgetOptions={storedWidget.widgetOptions}
                            chartOptions={storedWidget.chartOptions}
                            height={widgetHeight}
                            type={storedWidget.chartType}
                        />
                    )
                }
            };
        });
    };

    return {
        processLine,
        dashboardLayout,
        clearDashboard,
        widgets,
        updateWidget,
    };
};
