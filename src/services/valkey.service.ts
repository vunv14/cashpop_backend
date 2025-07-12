import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class ValkeyService {
  private readonly client: Redis;
  private readonly otpExpiry: number = 5 * 60; // 5 minutes in seconds
  private readonly verifiedExpiry: number = 30 * 60; // 30 minutes in seconds

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('VALKEY_HOST', 'localhost'),
      port: this.configService.get('VALKEY_PORT', 6379),
      password: this.configService.get('VALKEY_PASSWORD', ''),
      db: this.configService.get('VALKEY_DB', 0),
    });
  }

  /**
   * Store OTP for email verification
   * @param email User's email
   * @param otp One-time password
   */
  async storeOtp(email: string, otp: string): Promise<void> {
    const key = this.getOtpKey(email);
    const value = JSON.stringify({
      otp,
      timestamp: Date.now(),
    });
    await this.client.set(key, value, 'EX', this.otpExpiry);
  }

  /**
   * Get stored OTP for email
   * @param email User's email
   * @returns OTP data or null if not found
   */
  async getOtp(email: string): Promise<{ otp: string; timestamp: number } | null> {
    const key = this.getOtpKey(email);
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  /**
   * Delete OTP for email
   * @param email User's email
   */
  async deleteOtp(email: string): Promise<void> {
    const key = this.getOtpKey(email);
    await this.client.del(key);
  }

  /**
   * Mark email as verified
   * @param email User's email
   */
  async markEmailAsVerified(email: string): Promise<void> {
    const key = this.getVerifiedKey(email);
    await this.client.set(key, 'true', 'EX', this.verifiedExpiry);
  }

  /**
   * Check if email is verified
   * @param email User's email
   * @returns True if email is verified, false otherwise
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const key = this.getVerifiedKey(email);
    const value = await this.client.get(key);
    return value === 'true';
  }

  /**
   * Delete verification status for email
   * @param email User's email
   */
  async deleteVerificationStatus(email: string): Promise<void> {
    const key = this.getVerifiedKey(email);
    await this.client.del(key);
  }

  /**
   * Generate OTP key for email
   * @param email User's email
   * @returns OTP key
   */
  private getOtpKey(email: string): string {
    return `otp:${email}`;
  }

  /**
   * Generate verified key for email
   * @param email User's email
   * @returns Verified key
   */
  private getVerifiedKey(email: string): string {
    return `verified:${email}`;
  }
}
