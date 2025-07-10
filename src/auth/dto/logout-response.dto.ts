import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
  @ApiProperty({
    description: "Status message",
    example: "Logout successful",
  })
  message: string;
}