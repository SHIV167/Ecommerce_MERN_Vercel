import express from 'express';
import {
  getPromoTimers,
  createPromoTimer,
  updatePromoTimer,
  deletePromoTimer,
} from '../controllers/promoTimerController';

const router = express.Router();

router.get('/', getPromoTimers);
router.post('/', createPromoTimer);
router.put('/:id', updatePromoTimer);
router.delete('/:id', deletePromoTimer);

export default router;
