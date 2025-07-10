import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
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
    const tokens = await this.getTokens(user.id);
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

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const tokens = await this.getTokens(user.id);
      await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
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

    const tokens = await this.getTokens(user.id);
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

    const tokens = await this.getTokens(user.id);
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

  private async getTokens(userId: string) {
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
}
