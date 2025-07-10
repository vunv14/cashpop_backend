import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "The username of the user",
    example: "johndoe",
  })
  @IsString()
  @MinLength(3, { message: "Username must be at least 3 characters long" })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: "The email address of the user",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: "The password for the user account",
    example: "NewStrongPassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsOptional()
  password?: string;
}
