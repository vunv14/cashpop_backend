import { ApiProperty } from "@nestjs/swagger";

export class DeleteResponseDto {
  @ApiProperty({
    description: "Status message",
    example: "User successfully deleted",
  })
  message: string;
}