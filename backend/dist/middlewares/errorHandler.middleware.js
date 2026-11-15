"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_js_1 = require("../utils/logger.js");
function errorHandler(err, req, res, next) {
    logger_js_1.logger.error(`Unhandled Exception at ${req.method} ${req.url}:`, err.message || err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}
