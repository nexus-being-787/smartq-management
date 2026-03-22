import { Router } from 'express';
const router = Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { employeeId, password } = req.body;
  // TODO: validate against DB, compare bcrypt hash, issue JWT
  res.json({ user: { id: '1', name: 'Demo User', employeeId, role: 'DOCTOR', isActive: true }, token: 'demo-jwt', expiresAt: new Date(Date.now() + 86400000).toISOString() });
});

// POST /auth/otp/request
router.post('/otp/request', async (req, res) => {
  const { mobile } = req.body;
  // TODO: generate OTP, store in Redis with 5min TTL, send via Twilio
  console.log(`[OTP] Requested for ${mobile}`);
  res.json({ success: true });
});

// POST /auth/otp/verify
router.post('/otp/verify', async (req, res) => {
  const { mobile, otp } = req.body;
  // TODO: verify OTP from Redis, return patient + token
  res.json({ token: 'patient-jwt', patient: { id: 'p1', name: 'Demo Patient', mobile, age: 30, gender: 'M', isReturning: false } });
});

export default router;
