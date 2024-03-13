import PropTypes from "prop-types";
import { useState, useContext, useEffect } from "react";
import { dataSubscriber } from "../utils/dataService";

import widgetsContext from "../contexts/WidgetsContext";
import IdeContext from "../contexts/IdeContext";

import Chart from "react-apexcharts";
import ApexCharts from 'apexcharts';

export function Widget({ widgetOptions, height, chartOptions, type }) {
    const { locked } = useContext(widgetsContext);
    const { isDarkMode } = useContext(IdeContext);
    const [lastData, setLastData] = useState([]);
    const [extendedOptions, setExtendedOptions] = useState(chartOptions.options);

    useEffect(() => {
        setExtendedOptions((prev) => {
            return {
                ...prev,
                theme: {
                    mode: isDarkMode ? 'dark' : 'light'
                },
                chart: {
                    ...prev.chart,
                    toolbar: {
                        show: !locked,
                    }
                }
            };
        });
    }, [isDarkMode, locked]);

    useEffect(() => {
        const sub = dataSubscriber.subscribe({
            next: (data) => {
                if (!data || data.id !== widgetOptions.id) {
                    return;
                }
                const widgetData = data.data;
                const chartId = `chart-${widgetOptions.id}`;
                setLastData(widgetData);
        
                ApexCharts.exec(chartId, 'updateSeries', [{
                    data: locked ? widgetData : lastData
                }]);
            }
        });

        const cleanup = () => {
            sub.unsubscribe();
        };

        return cleanup;
    }, [lastData, widgetOptions.id, locked]);

    return <div
        id="widget"
        className={locked ? 'widget-locked' : ''}
    // style={{ height, background: 'white' }}
    >
        <div className="widget-header">{widgetOptions.label}</div>
        <div id="widget-content" style={{ padding: "10px" }}>
            <Chart
                options={extendedOptions}
                series={chartOptions.series}
                // data={chartOptions}
                type={type}
                height={height - 40}
            />
        </div>
    </div>;
}

Widget.propTypes = {
    widgetOptions: PropTypes.object.isRequired,
    height: PropTypes.number.isRequired,
    chartOptions: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
};
