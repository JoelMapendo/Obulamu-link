"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../utils/prisma.js");
const index_js_1 = require("../config/index.js");
class AuthService {
    async register(params) {
        const { phoneNumber, password, fullName, role = 'PATIENT', languagePref = 'EN' } = params;
        const cleanPhone = this.formatPhoneNumber(phoneNumber);
        const existing = await prisma_js_1.prisma.user.findUnique({
            where: { phoneNumber: cleanPhone }
        });
        if (existing) {
            // If user was auto-created by USSD and has default password, allow setting credentials
            if (existing.passwordHash === 'USSD_AUTO_GENERATED') {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                return await prisma_js_1.prisma.user.update({
                    where: { id: existing.id },
                    data: {
                        fullName,
                        passwordHash: hashedPassword,
                        role: role || existing.role,
                        languagePref: languagePref || existing.languagePref
                    }
                });
            }
            throw new Error('A user with this phone number already exists.');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                phoneNumber: cleanPhone,
                passwordHash: hashedPassword,
                fullName,
                role,
                languagePref
            }
        });
        return user;
    }
    async login(phoneNumber, password) {
        const cleanPhone = this.formatPhoneNumber(phoneNumber);
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { phoneNumber: cleanPhone }
        });
        if (!user) {
            throw new Error('Invalid phone number or password.');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid phone number or password.');
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            phoneNumber: user.phoneNumber,
            role: user.role,
            fullName: user.fullName,
            languagePref: user.languagePref
        }, index_js_1.config.jwtSecret, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                role: user.role,
                languagePref: user.languagePref
            }
        };
    }
    formatPhoneNumber(phone) {
        const clean = phone.replace(/[^0-9+]/g, '');
        if (clean.startsWith('0')) {
            return `+256${clean.substring(1)}`;
        }
        if (clean.startsWith('256')) {
            return `+${clean}`;
        }
        if (!clean.startsWith('+')) {
            return `+${clean}`;
        }
        return clean;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
