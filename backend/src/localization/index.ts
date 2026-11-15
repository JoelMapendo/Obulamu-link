import { en } from './en.js';
import { lg } from './lg.js';
import { Language } from '../types/index.js';

export const i18n = {
  t(key: keyof typeof en, lang: Language = 'EN', params?: Record<string, string>): string {
    const dict = lang === 'LG' ? lg : en;
    let template = dict[key] || en[key] || '';
    
    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
      }
    }
    return template;
  }
};

