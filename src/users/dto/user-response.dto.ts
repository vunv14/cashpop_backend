import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ 
    description: "The unique identifier of the user",
    example: "5f9d5a5b9c9d5a5b9c9d5a5b"
  })
  id: string;

  @ApiProperty({ 
    description: "The email address of the user",
    example: "user@example.com"
  })
  email: string;

  @ApiProperty({ 
    description: "Whether the user is registered via Facebook",
    example: false
  })
  isFacebookUser: boolean;

  @ApiProperty({
    description: "The Facebook ID of the user if registered via Facebook",
    example: "1234567890",
    required: false
  })
  facebookId: string;

  @ApiProperty({ 
    description: "Whether the user email is verified",
    example: false
  })
  isEmailVerified: boolean;

  @ApiProperty({ 
    description: "The date when the user was created",
    example: "2023-01-01T00:00:00Z"
  })
  createdAt: Date;

  @ApiProperty({ 
    description: "The date when the user was last updated",
    example: "2023-01-01T00:00:00Z"
  })
  updatedAt: Date;
}