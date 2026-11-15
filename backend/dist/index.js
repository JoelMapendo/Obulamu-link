"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = require("./config/index.js");
const logger_js_1 = require("./utils/logger.js");
const errorHandler_middleware_js_1 = require("./middlewares/errorHandler.middleware.js");
const reminder_cron_js_1 = require("./cron/reminder.cron.js");
// Route Imports
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const clinic_routes_js_1 = __importDefault(require("./routes/clinic.routes.js"));
const appointment_routes_js_1 = __importDefault(require("./routes/appointment.routes.js"));
const reminder_routes_js_1 = __importDefault(require("./routes/reminder.routes.js"));
const ussd_routes_js_1 = __importDefault(require("./routes/ussd.routes.js"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({ origin: index_js_1.config.corsOrigin, credentials: true }));
// Important: Africa's Talking sends USSD requests as application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)(index_js_1.config.nodeEnv === 'development' ? 'dev' : 'combined'));
// Base Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        system: 'Obulamu-Link API',
        ussdCode: index_js_1.config.ussdCode,
        timestamp: new Date().toISOString()
    });
});
// Mount Routes
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/clinics', clinic_routes_js_1.default);
app.use('/api/appointments', appointment_routes_js_1.default);
app.use('/api/reminders', reminder_routes_js_1.default);
app.use('/api/ussd', ussd_routes_js_1.default);
// Global Error Handler
app.use(errorHandler_middleware_js_1.errorHandler);
// Start Server
app.listen(index_js_1.config.port, () => {
    logger_js_1.logger.info(`=======================================================`);
    logger_js_1.logger.info(`🏥 Obulamu-Link Backend Server running on port ${index_js_1.config.port}`);
    logger_js_1.logger.info(`📡 Africa's Talking USSD Webhook: http://localhost:${index_js_1.config.port}/api/ussd`);
    logger_js_1.logger.info(`🌐 Environment: ${index_js_1.config.nodeEnv}`);
    logger_js_1.logger.info(`=======================================================`);
    // Initialize SMS and Reminder Cron Service
    (0, reminder_cron_js_1.initializeReminderCron)();
});
exports.default = app;
