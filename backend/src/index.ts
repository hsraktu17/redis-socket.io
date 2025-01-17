import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { Redis } from "ioredis";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
    adapter: createAdapter(redis),
});

const users: { [key: string]: string } = {};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('register', (username) => {
        users[username] = socket.id;
        console.log(`User registered: ${username} -> ${socket.id}`);

        socket.broadcast.emit('status', { username, status: 'online' });
    });

    socket.on('msg', (data) => {
        console.log(data);
        socket.broadcast.emit('msg', data);
    });

    socket.on('private', ({ to, message }) => {
        if (!to || !message) {
            return socket.emit('error', 'Invalid data: "to" and "message" are required.');
        }

        const recipientSocketId = users[to];
        if (!recipientSocketId) {
            return socket.emit('error', `User "${to}" is not online.`);
        }

        io.to(recipientSocketId).emit('private', { from: socket.id, message });

        socket.emit('message_sent', { to, message });
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);

        const username = Object.keys(users).find((key) => users[key] === socket.id);
        if (username) {
            delete users[username];
            console.log(`User removed: ${username}`);

            socket.broadcast.emit('status', { username, status: 'offline' });
        }
    });

    socket.on('typing', (to) => {
        const recipientSocketId = users[to];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('typing', { from: socket.id });
        }
    });

    socket.on('stop_typing', (to) => {
        const recipientSocketId = users[to];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('stop_typing', { from: socket.id });
        }
    });
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello World!' });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
