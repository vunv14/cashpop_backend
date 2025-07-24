import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { FileUploadModule } from "../file-upload/file-upload.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FileUploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService to be used in other modules like AuthModule
})
export class UsersModule {}
