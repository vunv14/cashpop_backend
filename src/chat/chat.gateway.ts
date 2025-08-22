import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from 'socket.io';
import {Logger} from "@nestjs/common";
import {ChatService} from "./chat.server";
import {MessageDto} from "./dto/message.dto";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly chatService: ChatService) {
    }

    private readonly logger = new Logger();

    @WebSocketServer()
    server: Server

    private users = new Map<string, string>();

    handleConnection(client: Socket) {
        this.logger.log(`User information connected to the socket : ${client.handshake.query.userId}`);

        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.users.set(userId, client.id);
            this.logger.log(`User ${userId} connected with socketId ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`User disconnected with socketId ${client.id}`);
        for (const [userId, socketId] of this.users) {
            if (socketId === client.id) {
                this.users.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    }

    /**
     * @param message DTO contains message data (userIdSend, userIdReceive, content)
     * Process:
     *  Call service to save a message to a database.
     *  Find the recipient's socketId from the list of online users.
     *  If the recipient is online, send 'receive_message' event to that socket.
     *  If the recipient is offline, the message is only saved in DB, not sent real-time.
     */
    @SubscribeMessage('send_message')
    async handleMessage(
        @MessageBody() message: MessageDto,
    ) {
        const {userIdSend, userIdReceive, content} = message;
        this.logger.log(`Received message from ${userIdSend} to ${content}`);

        // Call service to create a message in DB
        await this.chatService.createMessage(message);

        // Get recipient socket ID from online users list
        const receiverSocketId = this.users.get(userIdReceive);

        if (receiverSocketId) {
            // Emit a message to a recipient client
            this.server.to(receiverSocketId).emit('receive_message', {
                userIdReceive,
                content,
            });
            this.logger.log(`[Socket] Sent message to receiver ${userIdReceive} (socketId: ${receiverSocketId})`);
        } else {
            this.logger.warn(`Received message from ${userIdReceive} to ${content}`);
        }
    }

}