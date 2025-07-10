import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import * as FacebookTokenStrategy from "passport-facebook-token";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  FacebookTokenStrategy,
  "facebook-token"
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    // Get Facebook credentials
    const clientID = configService.get("FACEBOOK_APP_ID") || 'dummy-id';
    const clientSecret = configService.get("FACEBOOK_APP_SECRET") || 'dummy-secret';

    // Initialize the strategy with the available credentials or dummy values
    super({
      clientID,
      clientSecret,
    });

    // Log a warning if credentials are missing
    if (!configService.get("FACEBOOK_APP_ID") || !configService.get("FACEBOOK_APP_SECRET")) {
      console.warn('Facebook authentication is disabled due to missing credentials');
    }
  }

  // This method won't be used directly since we're handling the token verification in the controller
  // But we need to implement it for the strategy to work
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ) {
    const { emails } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : null;

    if (!email) {
      return done(
        new Error("Facebook authentication failed: No email provided"),
        null
      );
    }

    const user = {
      email,
      facebookId: profile.id,
    };

    done(null, user);
  }
}
