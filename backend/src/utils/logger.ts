export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  ussd: (sessionId: string, phone: string, input: string, response: string) => {
    console.log(`[USSD] [${sessionId.substring(0, 8)}] Phone: ${phone} | Input: "${input}" | Resp: "${response.substring(0, 40).replace(/\n/g, ' ')}..."`);
  }
};

