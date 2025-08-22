import {HttpStatus, Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Message} from "./entities/chat.entity";
import {Repository} from "typeorm";
import {MessageDto} from "./dto/message.dto";
import {UsersService} from "../users/users.service";
import {MessagesUsersDto} from "./dto/messages-users.dto";
import {ApiResponse} from "../common/response/ApiResponse";
import {PaginatedResponse} from "../common/response/paginated-response";


@Injectable()
export class ChatService {

    private readonly logger = new Logger(ChatService.name);

    constructor(@InjectRepository(Message)
                private messageRepository: Repository<Message>,
                private readonly userService: UsersService) {
    }

    /**
     * @Return Create a new message
     * @param message DTO contains message data (userIdSend, userIdReceive, content)
     * Process:
     * Get sender and receiver information from userService (runs in parallel with Promise.all).
     * Create new Message entity from input data
     * Save entity to database using messageRepository.save.
     * Return ApiResponse successfully if saved.
     * If there is an error, log details and throw InternalServerErrorException.
     */
    async createMessage(message: MessageDto) {
        const {userIdSend, userIdReceive, content} = message;
        this.logger.log(`Received message from ${userIdSend} to ${userIdReceive} : ${content}`);

        // Get message Sender and Receiver Information
        const [userSend, userReceive] = await Promise.all([
            this.userService.getProfile(userIdSend),
            this.userService.getProfile(userIdReceive)
        ])
        this.logger.log(`New message from ${userSend} to ${userReceive}`);

        try {
            // Create a new Message entity from the passed data
            const message = this.messageRepository.create({
                content: content,
                sender: userSend,
                receiver: userReceive,
            })
            this.logger.log('Message entity created: ' + JSON.stringify(message));

            // save to message db
            await this.messageRepository.save(message);

        } catch (err) {
            this.logger.error(`Failed to create message from ${userIdSend} : ${err}`);
            throw new InternalServerErrorException(`Create new message failed`);
        }

    }

    /**
     * Retrieves a message between users based on specified criteria.
     * @param {MessagesUsersDto} messageDto - Data transfer object containing details about the sender and receiver.
     * @return {Promise<void>} A promise that resolves when the operation is complete.
     */
    async getMessages(messageDto: MessagesUsersDto): Promise<ApiResponse> {

        const {userIdSend, userIdReceive, page, pageSize} = messageDto;
        this.logger.log(`Data received from client: ${userIdSend} ${userIdReceive} ${page} ${pageSize}`)

        const skip = (page - 1) * pageSize;

        // Get the list of messages between 2 users
        const query = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('(message.sender = :userIdSend AND message.receiver = :userIdReceive) OR (message.sender = :userIdReceive AND message.receiver = :userIdSend)',
                {userIdSend, userIdReceive}
            )

        // Get data and total number of messages
        const total = await query.getCount();

        // Get pagination data
        const messages = await query
            .orderBy('message.createdAt', 'DESC')
            .offset(skip)
            .limit(pageSize)
            .getRawMany();
        this.logger.log(`List of messages between ${userIdSend} and ${userIdReceive} with page: ${page} and pageSize: ${pageSize}`)

        return ApiResponse.success(PaginatedResponse(messages, page, pageSize, total), "List of messages", HttpStatus.OK);

    }


}