import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import WordCloudModule from 'highcharts/modules/wordcloud';
import io from 'socket.io-client';

WordCloudModule(Highcharts);
const socket = io('http://localhost:3001');

function WordCloudChart() {
    const [wordData, setWordData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        socket.on('topWordsUpdate', (updatedWords) => {

            if (!Array.isArray(updatedWords) ||
                !updatedWords.every(item => Array.isArray(item) && item.length === 2)) {
                setError("Received invalid data from the server.");
                return;
            }

            const formattedData = updatedWords.map(([word, count]) => {
                return { name: word, weight: count };
            });
            setWordData(formattedData);
        });

        return () => {
            socket.off('topWordsUpdate');
        };
    }, []);

    const options = {
        chart: {
            margin: [50, 50, 50, 50],
            backgroundColor: 'rgb(244,244,244)'
        },
        series: [{
            type: 'wordcloud',
            data: wordData,
            name: 'Occurrences',
            style: {
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                fontWeight: 'bold',
            },
            colors: [
                '#2E86C1', '#5DADE2', '#AED6F1', '#34495E', '#7FB3D5', '#1B4F72', '#21618C', '#2874A6', '#3498DB', '#85C1E9'
            ],
            tooltip: {
                pointFormat: '<b>{point.name}</b>: {point.weight} occurrences',
                style: {
                    fontSize: '14px'
                }
            }
        }],
        title: {
            text: 'Top Words from Twitch Chat',
            style: {
                color: '#333',
                fontSize: '24px', fontWeight: 'bold'
            }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 700
                },
                chartOptions: {
                    title: {
                        style: {
                            fontSize: '18px'
                        }
                    },
                    series: [{
                        style: {
                            fontSize: '14px'
                        }
                    }]
                }
            }, {
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    title: {
                        style: {
                            fontSize: '14px'
                        }
                    },
                    series: [{
                        style: {
                            fontSize: '12px'
                        }
                    }]
                }
            }]
        }
    };

    return (
        <>
            {error ? <p>{error}</p> :
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />}
        </>
    );
}

export default WordCloudChart;