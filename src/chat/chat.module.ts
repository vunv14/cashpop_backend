import {Module} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {ChatController} from "./chat.controller";
import {UsersModule} from "../users/users.module";
import {Message} from "./entities/chat.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatService} from "./chat.server";


@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Message])],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule {
}