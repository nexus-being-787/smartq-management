import { Router } from 'express';
const router = Router();

import jwt from 'jsonwebtoken';
import { query } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-use-a-long-random-string';

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await query('SELECT * FROM staff_users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, employeeId: user.employee_id }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Also record last login
    await query("UPDATE staff_users SET last_login = datetime('now') WHERE id = $1", [user.id]);
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        employeeId: user.employee_id, 
        role: user.role, 
        isActive: user.is_active 
      }, 
      token 
    });
  } catch(e) {
    console.error('Login error', e);
    res.status(500).json({ error: 'Internal server error during login' });
  }
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
