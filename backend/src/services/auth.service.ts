import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { config } from '../config/index.js';
import { Role, Language } from '../types/index.js';

export class AuthService {
  async register(params: {
    phoneNumber: string;
    password: string;
    fullName: string;
    role?: Role;
    languagePref?: Language;
  }) {
    const { phoneNumber, password, fullName, role = 'PATIENT', languagePref = 'EN' } = params;
    const cleanPhone = this.formatPhoneNumber(phoneNumber);

    const existing = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    if (existing) {
      // If user was auto-created by USSD and has default password, allow setting credentials
      if (existing.passwordHash === 'USSD_AUTO_GENERATED') {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await prisma.user.update({
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
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

  async login(phoneNumber: string, password: string) {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    if (!user) {
      throw new Error('Invalid phone number or password.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid phone number or password.');
    }

    const token = jwt.sign(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        fullName: user.fullName,
        languagePref: user.languagePref
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

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

  private formatPhoneNumber(phone: string): string {
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

export const authService = new AuthService();

