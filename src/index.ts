import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});

app.get('/api', (req: Request, res: Response) => {
    console.log('GET /api');
    res.send('GET /api');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
