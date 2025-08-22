import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";

export class MessageDto {

    @ApiProperty({
        description: "User id of the message sender",
        example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    userIdSend: string

    @ApiProperty({
        description: "User id of message recipient",
        example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6....",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    userIdReceive: string

    @ApiProperty({
        description: "Message content",
        example: "Hello world ....",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    content: string

}