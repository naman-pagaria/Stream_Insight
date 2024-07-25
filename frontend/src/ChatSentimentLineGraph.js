
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import io from 'socket.io-client';
import './ChatSentimentLineGraph.css';

const socket = io('http://localhost:3001');

const ChatSentimentLineGraph = () => {
    const [sentimentCountsOverTime, setSentimentTimeline] = useState([]);

    useEffect(() => {
        socket.on('sentimentCountsOverTime', data => {
            setSentimentTimeline(prevData => [...prevData, ...data]);
        });

        return () => {
            socket.off('sentimentCountsOverTime');
        };
    }, []);

const chartOptions = {
    chart: {
        height: 350,
        type: 'area',
        events: {
            dataPointSelection: function(event, chartContext, config) {
                console.log("Selected data point in line graph:", config.dataPointIndex);
            }
        },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
        },
        zoom: {
            enabled: true
        },
        toolbar: {
            show: true
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 5
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'light',
            type: "vertical",
            shadeIntensity: 0.4,
            gradientToColors: undefined,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.5,
        }
    },
    xaxis: {
        type: 'datetime',
        labels: {
            format: 'HH:mm',
        }
    },

    tooltip: {
    style: {
        colors: ['black'],
        background: '#f7f7f7'
    },
    x: {
        format: 'dd/MM/yy HH:mm'
    }

    },
    colors: ['#82ca9d', '#fc5858'],
    theme: {
        mode: 'dark'
    }
};

const series = [
    {
        name: "Positive",
        data: sentimentCountsOverTime.map(item => {
            const localDate = new Date(item.timestamp);
            return [localDate, item.positive];
        })
    },
    {
        name: "Negative",
        data: sentimentCountsOverTime.map(item => {
            const localDate = new Date(item.timestamp);
            return [localDate, item.negative];
        })
    }
];

return (
    <div className="line-graph-container">
        <h3>Chat Sentiment Over Time</h3>
        <ReactApexChart options={chartOptions} series={series} type="line" height={350} />
    </div>
);
}

export default ChatSentimentLineGraph;
