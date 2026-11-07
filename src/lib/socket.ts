import { io, Socket } from 'socket.io-client';
import { backendOrigin } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const origin = backendOrigin();
    socket = io(origin || undefined, { path: '/socket.io', autoConnect: true });
  }
  return socket;
}
