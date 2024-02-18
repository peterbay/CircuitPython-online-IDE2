import { useState, useRef, createContext, useContext, useEffect } from "react";
// import { Subject } from 'rxjs'
import { dataSubscriber, dataService } from "../dataService";

import widgetsContext from "./widgetsContext";

import Chart from "react-apexcharts";
import ApexCharts from 'apexcharts';

export function Widget({ widgetOptions, height, chartOptions, type }) {
    const { locked } = useContext(widgetsContext);

    useEffect(() => {

        const sub = dataSubscriber.subscribe({
            next: (data) => {
                if (!locked || !data || data.id !== widgetOptions.id) {
                    return;
                }
                const widgetData = data.data;
                const chartId = `chart-${widgetOptions.id}`;

                ApexCharts.exec(chartId, 'updateSeries', [{
                    data: widgetData
                }]);
            }
        });

        const cleanup = () => {
            sub.unsubscribe();
        };

        return cleanup;
    }, [widgetOptions, locked, height]);

    return <div
        id="widget"
        className={locked ? 'widget-locked' : ''}
        style={{ height, background: 'white' }}
    >
        <div className="widget-header">{widgetOptions.label}</div>
        <div id="widget-content" style={{ padding: "10px" }}>
            <Chart
                options={chartOptions.options}
                series={chartOptions.series}
                data={chartOptions}
                type={type}
                height={height - 40}
            />
        </div>
    </div>;
}
