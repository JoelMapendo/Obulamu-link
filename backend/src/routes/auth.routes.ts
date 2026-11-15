import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticateJwt, (req, res) => authController.getCurrentUser(req, res));

export default router;

