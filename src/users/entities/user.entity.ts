import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcrypt";
import { ApiProperty } from "@nestjs/swagger";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "The unique identifier of the user" })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: "The email address of the user" })
  email: string;

  @Column({ unique: true })
  @ApiProperty({ description: "The username of the user" })
  username: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ default: false })
  @ApiProperty({ description: "Whether the user is registered via Facebook" })
  isFacebookUser: boolean;

  @Column({ nullable: true })
  @ApiProperty({
    description: "The Facebook ID of the user if registered via Facebook",
  })
  facebookId: string;

  @Column({ default: false })
  @ApiProperty({ description: "Whether the user email is verified" })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: "The refresh token for JWT authentication" })
  @Exclude()
  refreshToken: string;

  @CreateDateColumn()
  @ApiProperty({ description: "The date when the user was created" })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: "The date when the user was last updated" })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}
