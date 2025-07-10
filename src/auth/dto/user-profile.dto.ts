import { ApiProperty } from "@nestjs/swagger";

export class UserProfileDto {
  @ApiProperty({
    description: "The unique identifier of the user",
    example: "5f9d5a5b9c9d5a5b9c9d5a5b",
  })
  userId: string;

  @ApiProperty({
    description: "The username of the user",
    example: "johndoe",
  })
  username: string;

  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
  })
  email: string;
}
