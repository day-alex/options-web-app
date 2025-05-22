// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import optionsRoutes from './routes/optionsRoutes';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', optionsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
