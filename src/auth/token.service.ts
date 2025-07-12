import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Generate access and refresh tokens for a user
   * @param userId User ID
   * @returns Object containing access and refresh tokens
   */
  async generateAuthTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get("JWT_SECRET"),
          expiresIn: this.configService.get("JWT_EXPIRATION", "15m"),
        }
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get(
            "JWT_REFRESH_SECRET",
            this.configService.get("JWT_SECRET")
          ),
          expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION", "7d"),
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate a short-lived JWT token for email verification
   * @param email User's email
   * @returns JWT token
   */
  async generateEmailVerificationToken(email: string) {
    return this.jwtService.signAsync(
      { email },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: "15m", // Short-lived token for email verification
      }
    );
  }

  /**
   * Verify a JWT token
   * @param token JWT token
   * @param options Verification options
   * @returns Decoded token payload
   */
  async verifyToken(token: string, options?: any) {
    return this.jwtService.verifyAsync(token, options);
  }
}