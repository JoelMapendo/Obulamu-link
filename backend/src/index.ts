import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { initializeReminderCron } from './cron/reminder.cron.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import clinicRoutes from './routes/clinic.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import ussdRoutes from './routes/ussd.routes.js';

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigin, credentials: true }));
// Important: Africa's Talking sends USSD requests as application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Obulamu-Link API',
    ussdCode: config.ussdCode,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ussd', ussdRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(`🏥 Obulamu-Link Backend Server running on port ${config.port}`);
  logger.info(`📡 Africa's Talking USSD Webhook: http://localhost:${config.port}/api/ussd`);
  logger.info(`🌐 Environment: ${config.nodeEnv}`);
  logger.info(`=======================================================`);

  // Initialize SMS and Reminder Cron Service
  initializeReminderCron();
});

export default app;

