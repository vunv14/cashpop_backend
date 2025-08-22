import {BaseEntity} from "../../common/entity/base-entity";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class Message extends BaseEntity {

    @Column()
    @ApiProperty({
        description: "The content of messages between two users."
    })
    content: string;

    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'sender_id'})
    sender: User;

    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'receiver_id'})
    receiver: User;

}



