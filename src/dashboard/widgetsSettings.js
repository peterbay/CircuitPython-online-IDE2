
const widgetsSettings = {
    line: {
        widget: {
            w: 2,
            h: 4,
            minW: 2,
            minH: 4,
        },
        type: "line",
        chart: {
            options: {
                chart: {
                    id: "basic-line",
                    animations: {
                        enabled: false,
                    },
                },
                xaxis: {
                    categories: []
                }
            },
            series: [
                {
                    name: "series-1",
                    data: [],
                }
            ]
        }
    },
    bar: {
        widget: {
            w: 2,
            h: 4,
            minW: 2,
            minH: 4,
        },
        type: "bar",
        chart: {
            options: {
                chart: {
                    id: "basic-bar",
                    animations: {
                        enabled: false,
                    },
                },
                xaxis: {
                    categories: []
                }
            },
            series: [
                {
                    name: "series-1",
                    data: [],
                }
            ]
        }
    }
};

export default widgetsSettings;
