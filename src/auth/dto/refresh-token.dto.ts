import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty({ message: "User ID is required" })
  userId: string;

  @ApiProperty({
    description: "Refresh token",
    example: "a1b2c3d4e5f6...",
  })
  @IsString()
  @IsNotEmpty({ message: "Refresh token is required" })
  refreshToken: string;
}
