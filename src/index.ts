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
    host : "localhost",
    port : 6379
});

const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: '*'
    },
    adapter: createAdapter(redis)
})

const users : {[key:string]:string}= {}

io.on('connection',(socket) =>{
    console.log(`User Connected: ${socket.id}`);
    console.log(users);

    socket.on('register',(username) =>{
        users[username] = socket.id;
        console.log("user registered",users);
    })

    socket.on('msg',(data) =>{
        console.log(data);
        io.emit('msg',data);
    })

    socket.on('private',({to, message}) =>{
        const userExist = users[to];
        console.log(JSON.stringify(message));
        if(!userExist){
            return;
        }else{
            io.to(userExist).emit('private',message);
        }
        
    })

    socket.on('disconnect',() =>{
        console.log(`User Disconnected: ${socket.id}`);
    })
})

app.get('/', (req: Request, res: Response) => {res.json({ message: 'Hello World!' });});    

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
