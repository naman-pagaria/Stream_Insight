import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import io from 'socket.io-client';
import './SentimentPieChart.css';

const socket = io('http://localhost:3001');

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
      <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill="#999" fontSize={14}>{`${value} msgs`}</text>
    </g>
  );
};

const SentimentPieChart = () => {
    const [sentimentCounts, setSentimentCounts] = useState({ positive: 0, negative: 0 });
    const [selectedN, setSelectedN] = useState(20);
    const [recentSentiments, setRecentSentiments] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        socket.on('updateSentimentCounts', data => {
            setSentimentCounts(data);
        });

        socket.on('recentSentiments', data => {
            const lastNMessages = data.slice(-selectedN);
            const positive = lastNMessages.filter(sentiment => sentiment === 'POSITIVE').length;
            const negative = selectedN - positive;
            setRecentSentiments([{name: 'Positive', value: positive}, {name: 'Negative', value: negative}]);
        });

        return () => {
            socket.off('updateSentimentCounts');
            socket.off('recentSentiments');
        };
    }, [selectedN]);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={400}>
                <PieChart onMouseEnter={onPieEnter}>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={[{name: 'Positive', value: sentimentCounts.positive}, {name: 'Negative', value: sentimentCounts.negative}]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        fill="#8884d8"
                    >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff7300" />
                    </Pie>

                    <Pie
                        data={recentSentiments}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        fill="#82ca9d"
                    >
                        <Cell fill="#c2e0c9" />
                        <Cell fill="#ffb284" />
                    </Pie>

                    <Tooltip />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
            </ResponsiveContainer>

            <div className="message-selection">
    <h3 className="recent-chat-sentiments">Recent Chat Sentiments</h3>
    <select value={selectedN} onChange={e => setSelectedN(Number(e.target.value))}>
        <option value={20}>Last 20 messages</option>
        <option value={50}>Last 50 messages</option>
        <option value={100}>Last 100 messages</option>
    </select>
</div>

        </div>
    );
}

export default SentimentPieChart;
