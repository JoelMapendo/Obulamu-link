"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    },
    ussd: (sessionId, phone, input, response) => {
        console.log(`[USSD] [${sessionId.substring(0, 8)}] Phone: ${phone} | Input: "${input}" | Resp: "${response.substring(0, 40).replace(/\n/g, ' ')}..."`);
    }
};
