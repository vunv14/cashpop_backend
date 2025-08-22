import {Body, Controller, Get, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {ChatService} from "./chat.server";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {MessagesUsersDto} from "./dto/messages-users.dto";


@Controller('chat')
@ApiTags("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {
    }

    @Get()
    @ApiOperation({summary: 'Get list of messages between 2 users'})
    @ApiBearerAuth()
    @ApiBody({type: MessagesUsersDto})
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        status: 200,
        description: "Get message data between 2 users successfully",
    })
    @ApiResponse({
        status: 401,
        description: "Unauthorized - User is not authenticated.",
    })
    @ApiResponse({
        status: 400,
        description: "Bad Request - Invalid input data.",
    })
    @ApiResponse({status: 404, description: "Not found"})
    async getMessages(@Body() messagesUsersDto: MessagesUsersDto): Promise<any> {
        return this.chatService.getMessages(messagesUsersDto);
    }

}