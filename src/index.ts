import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

const server = createServer(app);
const io = new Server(server)

io.on('connection',(socket) =>{
    console.log(`User Connected: ${socket.id}`);
    io.emit('message', 'Welcome to the chat');
})

app.get('/', (req: Request, res: Response) => {res.json({ message: 'Hello World!' });});    

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
