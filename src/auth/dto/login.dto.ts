import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "The username of the user",
    example: "johndoe",
  })
  @IsString()
  @IsNotEmpty({ message: "Username is required" })
  username: string;

  @ApiProperty({
    description: "The password for the user account",
    example: "StrongPassword123!",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;
}
