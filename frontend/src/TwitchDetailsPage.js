import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './twitch.css';

import SentimentPieChart from './SentimentPieChart.js';
import WordBubbleChart from './WordBubbleChart';
import ChatSentimentLineGraph from './ChatSentimentLineGraph.js';
import TopPositiveChatters from './TopPositiveChatters';

function AlertDropdown({ show }) {
    return (
        <div className={`alert-dropdown ${show ? 'show' : ''}`}>
            Alert! Sudden surge of negative comments
        </div>
    );
}

let socket;
function TwitchDetailsPage() {
    const [streamerName, setStreamerName] = useState('');
    const [messages, setMessages] = useState([]);
    const chatContainerRef = useRef(null);
    const [showPositiveOnly, setShowPositiveOnly] = useState(false);

    useEffect(() => {
        const chatContainer = document.querySelector(".twitch-chat-container");
        if (chatContainer) {
        }
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const [showAlert, setShowAlert] = useState(false);
    const [negativeCommentCount, setNegativeCommentCount] = useState(0);

    useEffect(() => {
        socket = io('http://localhost:3001');

        socket.on('chatMessage', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);

            if (message.sentiment === 'NEGATIVE') {
                setNegativeCommentCount(count => count + 1);

                if (negativeCommentCount >= 5) {
                    setShowAlert(true);
                    setTimeout(() => {
                        setShowAlert(false);
                        setNegativeCommentCount(0);
                    }, 5000);
                }
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleStreamerChange = (e) => {
        setStreamerName(e.target.value);
    };

    const handleSubmit = () => {
        socket.emit('changeChannel', streamerName);
    };

    return (
        <React.Fragment>
            <AlertDropdown show={showAlert} />
            <div className="container">
                <div className="twitch-chat-container">
                    <div className="chat-header">
                        <input type="text" value={streamerName} onChange={handleStreamerChange} placeholder="Enter Streamer Name" />
                        <button onClick={handleSubmit}>Fetch Chat</button>

                        <button onClick={() => setShowPositiveOnly(prev => !prev)}>
                            {showPositiveOnly ? "Show All" : "Show Positive Only"}
                        </button>
                    </div>

                    <div className="chat-messages-container" ref={chatContainerRef}>
                        {messages
                            .filter(msg => !showPositiveOnly || msg.sentiment === 'POSITIVE')
                            .map((msg, index) => (
                                <div key={index} className="chat-message">
                                    <strong>{msg.user}:</strong> {msg.message} <i className={`sentiment-${msg.sentiment.toLowerCase()}`}>{msg.sentiment}</i>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <SentimentPieChart />
                <ChatSentimentLineGraph />
                <WordBubbleChart />
                <TopPositiveChatters />
            </div>
        </React.Fragment>
    )
}

export default TwitchDetailsPage;
