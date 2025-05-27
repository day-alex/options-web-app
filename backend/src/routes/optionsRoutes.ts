import { Router } from 'express';
import { optionsController } from '../controllers/optionsController';

const router = Router();

// POST endpoint for options calculations
router.post('/submit', optionsController.calculateOptions);
router.get('/options/ticker', optionsController.yfOption);

export default router;
