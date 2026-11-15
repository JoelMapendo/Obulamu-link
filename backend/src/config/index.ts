import dotenv from 'dotenv';
dotenv.config();

export const config = {
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

