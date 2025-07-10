import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { FacebookAuthDto } from "./dto/facebook-auth.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { TokensResponseDto } from "./dto/tokens-response.dto";
import { LogoutResponseDto } from "./dto/logout-response.dto";
import { UserProfileDto } from "./dto/user-profile.dto";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ 
    status: 201, 
    description: "User successfully registered",
    type: AuthResponseDto
  })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ 
    status: 200, 
    description: "Login successful",
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() loginDto: LoginDto, @Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout" })
  @ApiResponse({ 
    status: 200, 
    description: "Logout successful",
    type: LogoutResponseDto
  })
  async logout(@Body() logoutDto: LogoutDto, @Req() req) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ 
    status: 200, 
    description: "Token refreshed successfully",
    type: TokensResponseDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto, @Req() req) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post("facebook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with Facebook token" })
  @ApiResponse({ 
    status: 200, 
    description: "Login successful",
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 409,
    description: "Email already registered with a different method",
  })
  async facebookLogin(@Body() facebookAuthDto: FacebookAuthDto) {
    const { email, facebookId } = await this.authService.validateFacebookToken(
      facebookAuthDto.token
    );
    return this.authService.facebookLogin(email, facebookId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({ 
    status: 200, 
    description: "Return the user profile",
    type: UserProfileDto
  })
  getProfile(@Req() req): UserProfileDto {
    return req.user;
  }
}
