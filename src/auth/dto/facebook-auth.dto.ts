import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FacebookAuthDto {
  @ApiProperty({
    description: "The Facebook access token obtained from the mobile client",
    example: "EAABZCqZCZCZCZCZC...",
  })
  @IsString()
  @IsNotEmpty({ message: "Facebook token is required" })
  token: string;
}
