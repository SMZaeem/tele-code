import io from 'socket.io-client';

// Initialize socket connection once
export const socket = io(import.meta.env.VITE_BACKEND_URL);