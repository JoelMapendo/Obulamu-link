"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
class AuthController {
    async register(req, res, next) {
        try {
            const { phoneNumber, password, fullName, role, languagePref } = req.body;
            if (!phoneNumber || !password || !fullName) {
                return res.status(400).json({ success: false, message: 'phoneNumber, password, and fullName are required.' });
            }
            const user = await auth_service_js_1.authService.register({
                phoneNumber,
                password,
                fullName,
                role,
                languagePref
            });
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    fullName: user.fullName,
                    role: user.role,
                    languagePref: user.languagePref
                }
            });
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const { phoneNumber, password } = req.body;
            if (!phoneNumber || !password) {
                return res.status(400).json({ success: false, message: 'phoneNumber and password are required.' });
            }
            const result = await auth_service_js_1.authService.login(phoneNumber, password);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (err) {
            res.status(401).json({ success: false, message: err.message });
        }
    }
    async getCurrentUser(req, res) {
        res.status(200).json({
            success: true,
            data: req.user
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
