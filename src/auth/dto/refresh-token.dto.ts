import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    description: "The username of the user",
    example: "johndoe",
  })
  @IsString()
  @IsNotEmpty({ message: "Username is required" })
  username: string;

  @ApiProperty({
    description: "Refresh token",
    example: "a1b2c3d4e5f6...",
  })
  @IsString()
  @IsNotEmpty({ message: "Refresh token is required" })
  refreshToken: string;
}
