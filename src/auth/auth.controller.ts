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
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RefreshGuard } from "./guards/refresh.guard";
import { EmailVerificationGuard } from "./guards/email-verification.guard";
import { FacebookAuthDto } from "./dto/facebook-auth.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { TokensResponseDto } from "./dto/tokens-response.dto";
import { LogoutResponseDto } from "./dto/logout-response.dto";
import { UserProfileDto } from "./dto/user-profile.dto";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyEmailInitiateDto } from "./dto/verify-email-initiate.dto";
import { VerifyEmailOtpDto } from "./dto/verify-email-otp.dto";
import { 
  VerifyEmailInitiateResponseDto, 
  VerifyEmailOtpResponseDto 
} from "./dto/verify-email-response.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post("verify-email-initiate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Initiate email verification by sending OTP" })
  @ApiResponse({
    status: 200,
    description: "Verification email sent",
    type: VerifyEmailInitiateResponseDto
  })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async verifyEmailInitiate(@Body() verifyEmailInitiateDto: VerifyEmailInitiateDto) {
    return this.authService.initiateEmailVerification(verifyEmailInitiateDto.email);
  }

  @Post("verify-email-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email with OTP" })
  @ApiResponse({
    status: 200,
    description: "Email verified successfully",
    type: VerifyEmailOtpResponseDto
  })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async verifyEmailOtp(@Body() verifyEmailOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(verifyEmailOtpDto.email, verifyEmailOtpDto.otp);
  }

  @UseGuards(EmailVerificationGuard)
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user with verified email token" })
  @ApiResponse({ 
    status: 201, 
    description: "User successfully registered",
    type: AuthResponseDto
  })
  @ApiResponse({ status: 409, description: "Email already exists" })
  @ApiResponse({ status: 401, description: "Invalid or expired verification token" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
  async logout(@Req() req) {
    return this.authService.logout(req.user);
  }

  @UseGuards(RefreshGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ 
    status: 200, 
    description: "Token refreshed successfully",
    type: TokensResponseDto
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto, @Req() req) {
    return this.authService.refreshTokens(req.user);
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
