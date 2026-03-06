import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
export function useSocket() {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            return;
        }
        const newSocket = io((import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL) || 'http://localhost:3000', {
            auth: {
                token,
            },
        });
        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket conectado');
        });
        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket desconectado');
        });
        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });
        setSocket(newSocket);
        return () => {
            newSocket.close();
        };
    }, []);
    return { socket, isConnected };
}
