import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, password, fullName, role, languagePref } = req.body;
      if (!phoneNumber || !password || !fullName) {
        return res.status(400).json({ success: false, message: 'phoneNumber, password, and fullName are required.' });
      }

      const user = await authService.register({
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
    } catch (err: any) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, password } = req.body;
      if (!phoneNumber || !password) {
        return res.status(400).json({ success: false, message: 'phoneNumber and password are required.' });
      }

      const result = await authService.login(phoneNumber, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    res.status(200).json({
      success: true,
      data: req.user
    });
  }
}

export const authController = new AuthController();

