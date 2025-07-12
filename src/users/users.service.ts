import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException("Email already exists");
    }

    // Check if username already exists
    const existingUserByUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException("Username already exists");
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async createFacebookUser(email: string, facebookId: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // Generate a username based on the email (before the @ symbol)
    let baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    // Check if username exists, if so, append a number
    while (await this.findByUsername(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const user = this.usersRepository.create({
      email,
      username,
      facebookId,
      isFacebookUser: true,
    });

    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });
  }

  async setRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }
}
