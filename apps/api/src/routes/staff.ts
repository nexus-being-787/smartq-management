import { Router } from 'express';
import { getAllStaff, getStaffById, createStaff, updateStaffStaff } from '../services/staff.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const staff = await getAllStaff();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const staff = await getStaffById(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

router.post('/', async (req, res) => {
  try {
    const staff = await createStaff(req.body);
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const staff = await updateStaffStaff(req.params.id, req.body);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

export default router;
