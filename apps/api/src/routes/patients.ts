import { Router } from 'express';
import { getPatientById, getPatientByMobile, createPatient } from '../services/patient.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { mobile } = req.query;
    if (mobile) {
      const patient = await getPatientByMobile(mobile as string);
      return res.json(patient);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

router.post('/', async (req, res) => {
  try {
    const patient = await createPatient(req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

export default router;
