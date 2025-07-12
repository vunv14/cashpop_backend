import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import {AuthService} from "../auth.service";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh") {
  constructor(
    private authService: AuthService,
  ) {
    super({
      usernameField: "username",
      passwordField: "refreshToken",
    });
  }

  async validate(username: string, refreshToken: string): Promise<any> {
    const user = await this.authService.validateRefreshToken(username, refreshToken);
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return user;
  }
}