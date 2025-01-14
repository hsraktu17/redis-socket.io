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
        console.log(`User registered:`, users);
    });

    socket.on('msg', (data) => {
        console.log(data);
        socket.broadcast.emit('msg', data);
    });

    socket.on('private', ({ to, message }) => {
        if (!to || !message) {
            return socket.emit('error', 'Invalid data: "to" and "message" are required.');
        }

        const userExist = users[to];
        if (!userExist) {
            return socket.emit('error', `User "${to}" is not registered or online.`);
        }

        io.to(userExist).emit('private', { from: socket.id, message });
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
        for (const username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                break;
            }
        }
        console.log(users);
    });
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello World!' });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
