import { Router } from 'express';
import { getDailyStats } from '../services/analytics.service';

const router = Router();

router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const stats = await getDailyStats((date as string) || new Date().toISOString().split('T')[0]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
