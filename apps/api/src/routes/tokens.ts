import { Router } from 'express';
import { issueToken, updateTokenStatus } from '../services/token.service';
import { io } from '../index';
import { WSEvent } from '@smartq/types';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const token = await issueToken(req.body);
    
    // Broadcast event
    const event: WSEvent = {
      type: 'QUEUE_UPDATED', // Can be specific, but QUEUE_UPDATED often triggers a refresh
      departmentId: token.departmentId,
      payload: { token, action: 'CREATED' },
      timestamp: new Date().toISOString()
    };
    io.to(`dept:${token.departmentId}`).emit('event', event);
    io.emit('activity', { 
      id: Date.now(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Token ${token.displayNumber} issued`,
      actor: 'Receptionist',
      type: token.priority === 'EMERGENCY' ? 'error' : 'info'
    });

    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue token' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const token = await updateTokenStatus(req.params.id, req.body.status);
    if (!token) return res.status(404).json({ error: 'Token not found' });

    // Broadcast event
    const event: WSEvent = {
      type: 'TOKEN_STATUS_CHANGED',
      departmentId: token.departmentId,
      payload: { token },
      timestamp: new Date().toISOString()
    };
    io.to(`dept:${token.departmentId}`).emit('event', event);
    io.emit('activity', { 
      id: Date.now(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Token ${token.displayNumber} marked ${token.status}`,
      actor: 'Doctor',
      type: token.status === 'CALLED' ? 'warning' : 'success'
    });

    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token status' });
  }
});

export default router;
