import { Router } from 'express';
import { ussdController } from '../controllers/ussd.controller.js';

const router = Router();

// Africa's Talking USSD Webhook (supports GET and POST for testing flexibility)
router.post('/', (req, res) => ussdController.handleUssd(req, res));
router.get('/', (req, res) => ussdController.handleUssd(req, res));

// Outbound SMS logs stream for real-time simulator view
router.get('/sms-logs', (req, res) => ussdController.getSmsLogs(req, res));

export default router;

