import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  FIND_USERNAME = 'find_username'
}

@Injectable()
export class ValkeyService {
  private readonly client: Redis;
  private readonly defaultOtpExpiry: number = 5 * 60; // 5 minutes in seconds

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('VALKEY_HOST', 'localhost'),
      port: this.configService.get('VALKEY_PORT', 6379),
      password: this.configService.get('VALKEY_PASSWORD', ''),
      db: this.configService.get('VALKEY_DB', 0),
    });
  }

  /**
   * Store OTP for email verification or password reset
   * @param email User's email
   * @param otp One-time password
   * @param type Type of OTP (registration or password reset)
   * @param otpExpiry Expiry time
   */
  async storeOtp(email: string, otp: string, type: OtpType = OtpType.REGISTRATION, otpExpiry = this.defaultOtpExpiry): Promise<void> {
    const key = this.getOtpKey(email, type);
    const value = JSON.stringify({
      otp,
      timestamp: Date.now(),
    });
    await this.client.set(key, value, 'EX', otpExpiry);
  }

  /**
   * Get stored OTP for email
   * @param email User's email
   * @param type Type of OTP (registration or password reset)
   * @returns OTP data or null if not found
   */
  async getOtp(email: string, type: OtpType = OtpType.REGISTRATION): Promise<{ otp: string; timestamp: number } | null> {
    const key = this.getOtpKey(email, type);
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  /**
   * Generate OTP key for email
   * @param email User's email
   * @param type Type of OTP (registration or password reset)
   * @returns OTP key
   */
  private getOtpKey(email: string, type: OtpType = OtpType.REGISTRATION): string {
    return `otp:${type}:${email}`;
  }
}
