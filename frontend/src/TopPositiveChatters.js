import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const socket = io('http://localhost:3001');

const Container = styled.div`
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #f4f4f4;
    padding: 20px;
    border-radius: 8px;
`;

const Title = styled.h2`
    font-weight: bold;
    font-size: 28px;
    text-align: center;
    color: #333;
    margin-bottom: 16px;
`;

const ListItem = styled(motion.li)`
    padding: 8px 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    &:hover {
        background-color: #e6e6e6;
    }
    margin: 8px 0;
    font-size: 18px;
`;

const Spinner = styled.div`
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-top: 4px solid #333;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadMoreButton = styled.button`
    margin-top: 16px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    background-color: #333;
    color: #ffffff;
    border-radius: 5px;
    &:hover {
        background-color: #555;
    }
`;

function TopPositiveChatters() {
    const [chatters, setChatters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleItemClick = (name) => {
        alert('Navigating to profile of ' + name);
    }

    const handleLoadMore = () => {
        const moreChatters = [...chatters, ...chatters];
        setChatters(moreChatters);
    }

    useEffect(() => {
        socket.on('connect_error', (err) => {
            setError('Connection error. Please try again later.');
            setLoading(false);
        });

        socket.on('updateTopPositiveChatters', (updatedChatters) => {
            setChatters(updatedChatters);
            setLoading(false);
        });

        return () => {
            socket.off('updateTopPositiveChatters');
        };
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <Container>
            <Title>Top Positive Chatters</Title>
            <motion.ul>
                {chatters.map((chatter, index) => (
                    <ListItem
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <div onClick={() => handleItemClick(chatter[0])}>
                            <strong>{chatter[0]}</strong>:
                            <span style={{color: 'black'}}>{chatter[1]} positive messages</span>
                        </div>
                    </ListItem>
                ))}
            </motion.ul>
            <LoadMoreButton onClick={handleLoadMore}>Load More</LoadMoreButton>
        </Container>
    );
}

export default TopPositiveChatters;
