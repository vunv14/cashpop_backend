import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "./user-response.dto";
import { TokensResponseDto } from "./tokens-response.dto";

export class AuthResponseDto extends TokensResponseDto {
  @ApiProperty({
    description: "User information",
    type: UserResponseDto,
  })
  user: UserResponseDto;
}