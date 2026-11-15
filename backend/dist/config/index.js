"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-obulamu-link-jwt-key-2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    africasTalking: {
        apiKey: process.env.AT_API_KEY || 'sandbox',
        username: process.env.AT_USERNAME || 'sandbox',
        senderId: process.env.AT_SENDER_ID || 'OBULAMU',
        isSandbox: (process.env.AT_ENVIRONMENT || 'sandbox').toLowerCase() === 'sandbox'
    },
    ussdCode: process.env.USSD_CODE || '*284#',
    corsOrigin: process.env.CORS_ORIGIN || '*'
};
