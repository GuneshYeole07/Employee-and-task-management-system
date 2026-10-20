import { Router } from 'express';
import { summary } from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/', summary);
export default router;
