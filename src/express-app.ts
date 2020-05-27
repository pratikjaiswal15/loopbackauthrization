import express, {Request, Response} from 'express';


const legacyApp = express.Router();



legacyApp.get('/api', function (_req: Request, res: Response) {
  res.send('Pug!');
});


legacyApp.get('/payments', function (_req: Request, res: Response) {
  res.send('Pug!');
});

export {legacyApp};

