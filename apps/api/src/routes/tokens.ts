import { Router } from 'express';
import { issueToken, updateTokenStatus, getQueueForDepartment } from '../services/token.service';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const token = await issueToken(req.body);
    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue token' });
  }
});

router.get('/:id', async (req, res) => {
  // TODO: implement getById
  res.status(501).json({ error: 'Not implemented' });
});

router.patch('/:id/status', async (req, res) => {
  try {
    const token = await updateTokenStatus(req.params.id, req.body.status);
    if (!token) return res.status(404).json({ error: 'Token not found' });
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token status' });
  }
});

export default router;
