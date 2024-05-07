import PropTypes from "prop-types";
import { useState, useContext, useEffect } from "react";
import { dataSubscriber } from "../utils/dataService";

import IdeContext from "../contexts/IdeContext";

import Chart from "react-apexcharts";
import ApexCharts from 'apexcharts';
export function Widget({ widgetOptions, height, chartOptions, type, widgetType }) {
    const { themeApi, dashboardApi } = useContext(IdeContext);
    const [extendedOptions, setExtendedOptions] = useState(chartOptions.options);

    console.log('widgetOptions', widgetOptions);

    useEffect(() => {
        setExtendedOptions((prev) => {
            return {
                ...prev,
                theme: {
                    mode: themeApi.isDarkMode ? 'dark' : 'light'
                },
            };
        });
    }, [themeApi.isDarkMode]);

    useEffect(() => {
        setExtendedOptions((prev) => {
            return {
                ...prev,
                chart: {
                    ...prev.chart,
                    toolbar: {
                        show: !dashboardApi.locked,
                    }
                }
            };
        });
    }, [dashboardApi.locked]);

    const nextData = (data) => {
        if (!data || data?.id !== widgetOptions?.id) {
            return;
        }

        const widgetData = data?.data;
        const chartId = `chart-${widgetOptions?.id}`;

        if (widgetType === 'chart') {
            ApexCharts.exec(chartId, 'updateSeries', [{
                data: widgetData,
            }]);
        }
    };

    useEffect(() => {
        const sub = dataSubscriber.subscribe({
            next: nextData,
        });

        const cleanup = function () {
            sub.unsubscribe();
        };
        return cleanup;
    }, []);

    return <div
        id="widget"
        className={dashboardApi.locked ? 'widget-locked' : ''}
    // style={{ height, background: 'white' }}
    >
        <div className="widget-header">
            {widgetOptions.label}
        </div>
        <div
            id="widget-content"
            style={{ padding: "10px" }}
        >
            {widgetType === 'chart' &&
                <Chart
                    options={extendedOptions}
                    series={chartOptions.series}
                    type={type}
                    height={height - 40}
                />
            }
        </div>
    </div>;
}

Widget.propTypes = {
    widgetOptions: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    chartOptions: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
};
