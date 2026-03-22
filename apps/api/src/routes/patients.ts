import { Router } from 'express';
const router = Router();
// TODO: implement routes — connect to PostgreSQL + Redis services
// See @smartq/api-client/src/index.ts for all expected endpoints
router.get('/', (_req, res) => res.json([]));
router.post('/', (_req, res) => res.json({ id: 'new', ...(_req.body) }));
router.get('/:id', (req, res) => res.json({ id: req.params.id }));
router.patch('/:id', (req, res) => res.json({ id: req.params.id, ...(req.body) }));
export default router;
