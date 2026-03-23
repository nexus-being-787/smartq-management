import { Router } from 'express';
import { getAllDoctors, getDoctorById, updateDoctorStatus } from '../services/doctor.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const doctors = await getAllDoctors();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await updateDoctorStatus(req.params.id, status);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update doctor status' });
  }
});

export default router;
