import http from 'http';

import logger from '@server/logger';
import { Dictionary } from '@server/typing/generics';
import { Server as SockerIoServer, Socket as SocketIoSocket } from 'socket.io';
import { v4 as uuid4 } from 'uuid';

export interface Subscriber<T> {
    (data: T): void;
}

class SocketWrapper {
    io!: SockerIoServer;
    socket: SocketIoSocket | null = null;
    subscribers: Dictionary<Dictionary<any>> = {};

    public async initialize(server: http.Server) {
        this.io = new SockerIoServer(server);

        return new Promise((resolve) => {
            this.io.on('connection', (socket: SocketIoSocket) => {
                logger.info('Websockets started');
                this.socket = socket;
                resolve(socket);
            });
        });
    }

    public emit<T = Dictionary>(event: string, payload: T): void {
        if (!event) {
            logger.warn(`Attempt to send empty event to websocket`);
            return;
        }

        if (!this.socket) {
            logger.warn(`Attempt to send data to not ready websocket`);
            return;
        }

        this.socket.emit(event, payload);
    }

    public subscribe<T = Dictionary>(event: string, subscriber: Subscriber<T>): string {
        const uuid = uuid4();

        if (!this.subscribers[event]) {
            this.subscribers[event] = {};
        }

        this.subscribers[event][uuid] = subscriber;

        return uuid;
    }

    public unsubscribe(subscriberId: string): void {
        for (const event in this.subscribers) {
            if (this.subscribers[event][subscriberId]) {
                delete this.subscribers[event][subscriberId];
            }
        }
    }
}

export default new SocketWrapper();
