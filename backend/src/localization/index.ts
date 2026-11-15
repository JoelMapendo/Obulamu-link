import { en } from './en.js';
import { lg } from './lg.js';
import { sw } from './sw.js';
import { Language } from '../types/index.js';

export const i18n = {
  t(key: keyof typeof en, lang: Language = 'EN', params?: Record<string, string>): string {
    let dict = en;
    if (lang === 'LG') dict = lg as any;
    else if (lang === 'SW') dict = sw as any;

    let template = (dict as any)[key] || en[key] || '';
    
    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
      }
    }
    return template;
  }
};
