import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { ValkeyService } from "../services/valkey.service";
import { MailerService } from "../services/mailer.service";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private valkeyService: ValkeyService,
    private mailerService: MailerService,
    private tokenService: TokenService
  ) {}

  async validateUser(usernameOrEmail: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const tokens = await this.tokenService.generateAuthTokens(user.id);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    };
  }

  /**
   * Register a new user with verified email token
   * @param createUserDto DTO with username, password, and token
   * @returns User and authentication tokens
   */
  async register(createUserDto: CreateUserDto) {
    try {
      // Check if email already exists
      const existingUser = await this.usersService.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException("Email already exists");
      }

      // Create the user
      const user = await this.usersService.create({
        email: createUserDto.email,
        username: createUserDto.username,
        password: createUserDto.password,
      });

      // Generate tokens
      const tokens = await this.tokenService.generateAuthTokens(user.id);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Registration failed");
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("Access Denied");
    }

    // In a real application, you should verify the refresh token
    // This is a simplified version
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException("Access Denied");
    }

    const tokens = await this.tokenService.generateAuthTokens(user.id);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { message: "Logout successful" };
  }

  async validateFacebookToken(token: string): Promise<any> {
    // In a real application, you would make an HTTP request to Facebook Graph API
    // to verify the token and get user information
    try {
      // This is a simplified implementation
      // In production, you should use the Facebook Graph API to verify the token
      // Example: https://graph.facebook.com/me?fields=email,id&access_token=TOKEN

      // For demonstration purposes, we'll make a simple HTTP request to Facebook
      // You would typically use HttpService from @nestjs/axios for this
      const axios = require("axios");
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=email,id&access_token=${token}`
      );

      const { email, id } = response.data;

      if (!email) {
        throw new UnauthorizedException(
          "Facebook authentication failed: No email provided"
        );
      }

      return {
        email,
        facebookId: id,
      };
    } catch (error) {
      // If the token is invalid or expired, Facebook will return an error
      throw new UnauthorizedException("Invalid Facebook token");
    }
  }

  async facebookLogin(email: string, facebookId: string) {
    let user = await this.usersService.findByEmail(email);

    if (user) {
      // If user exists but is not a Facebook user, return error
      if (!user.isFacebookUser) {
        throw new ConflictException(
          "Email already registered with a different method"
        );
      }
    } else {
      // Create new user if not exists
      user = await this.usersService.createFacebookUser(email, facebookId);
    }

    const tokens = await this.tokenService.generateAuthTokens(user.id);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    };
  }

  /**
   * Initiate email verification by sending OTP
   * @param email Email address to verify
   * @returns Message indicating verification email was sent
   */
  async initiateEmailVerification(email: string) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // Check if OTP already exists for this email
    const existingOtp = await this.valkeyService.getOtp(email);
    if (existingOtp) {
      throw new BadRequestException("OTP already sent to this email address. Please check your inbox or try again after 5 minutes.");
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Valkey (with 5 minutes TTL as configured in ValkeyService)
    await this.valkeyService.storeOtp(email, otp);

    // Send OTP via email
    await this.mailerService.sendOtpEmail(email, otp);

    return {
      message: "Verification email sent",
    };
  }

  /**
   * Verify email with OTP
   * @param email Email address to verify
   * @param otp One-time password
   * @returns Verification status and token
   */
  async verifyEmailOtp(email: string, otp: string) {
    // Get stored OTP from Valkey
    const storedOtpData = await this.valkeyService.getOtp(email);

    if (!storedOtpData) {
      throw new BadRequestException("OTP expired or not found");
    }

    // Check if OTP matches
    if (storedOtpData.otp !== otp) {
      throw new BadRequestException("Invalid OTP");
    }

    // Generate a short-lived JWT token with email in payload
    const token = await this.tokenService.generateEmailVerificationToken(email);

    return {
      message: "Email verified successfully",
      verified: true,
      token,
    };
  }

}
