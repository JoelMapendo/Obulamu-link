"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = void 0;
const en_js_1 = require("./en.js");
const lg_js_1 = require("./lg.js");
const sw_js_1 = require("./sw.js");
exports.i18n = {
    t(key, lang = 'EN', params) {
        let dict = en_js_1.en;
        if (lang === 'LG')
            dict = lg_js_1.lg;
        else if (lang === 'SW')
            dict = sw_js_1.sw;
        let template = dict[key] || en_js_1.en[key] || '';
        if (params) {
            for (const [paramKey, value] of Object.entries(params)) {
                template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
            }
        }
        return template;
    }
};
