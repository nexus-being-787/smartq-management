import { Router } from 'express';
import { getQueueForDepartment } from '../services/token.service';

const router = Router();

router.get('/:departmentId', async (req, res) => {
  try {
    const tokens = await getQueueForDepartment(req.params.departmentId);
    res.json({
      tokens,
      isPaused: false, // TODO: store in Redis/DB
      isOverflowMode: false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue state' });
  }
});

export default router;
