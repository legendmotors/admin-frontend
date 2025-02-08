import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'ws://localhost:4000'; // Make sure this matches your WebSocket server's URL

export const useSocket = () => {
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('progress', (data) => {
            if (data.progress) setProgress(data.progress);
            if (data.message) setStatusMessage(data.message);
        });

        return () => {
            socket.off('progress');
            socket.disconnect(); // Cleanup connection on unmount
        };
    }, []);

    return { progress, statusMessage };
};
