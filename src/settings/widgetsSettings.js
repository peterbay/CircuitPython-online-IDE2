const widgetsSettings = {
    line: {
        widget: {
            w: 2,
            h: 6,
            minW: 2,
            minH: 6,
        },
        type: 'line',
        widgetType: 'chart',
        chart: {
            options: {
                chart: {
                    id: 'basic-line',
                    animations: {
                        enabled: false,
                    },
                },
                xaxis: {
                    categories: [],
                },
            },
            series: [
                {
                    name: 'series-1',
                    data: [],
                },
            ],
        },
    },
    bar: {
        widget: {
            w: 2,
            h: 6,
            minW: 2,
            minH: 6,
        },
        type: 'bar',
        widgetType: 'chart',
        chart: {
            options: {
                chart: {
                    id: 'basic-bar',
                    animations: {
                        enabled: false,
                    },
                },
                xaxis: {
                    categories: [],
                },
            },
            series: [
                {
                    name: 'series-1',
                    data: [],
                },
            ],
        },
    },
    label: {
        type: 'label',
        widgetType: 'label',
    },
};

export default widgetsSettings;
