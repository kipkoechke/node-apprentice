import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageService } from 'src/common/services/image.service';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private imageService: ImageService,
  ) {}

  async getAllUsers(): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.find();
    const total = await this.userRepository.count();
    return { total, users };
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateMe(
    userId: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    // 1) Check if user is trying to update password through this route
    if (updateUserDto.password) {
      throw new BadRequestException(
        'This route is not for password updates. Please use /updateMyPassword.',
      );
    }

    // 2) Filter out unwanted fields that are not allowed to be updated
    const allowedFields = ['name', 'email'];
    const filteredData = Object.keys(updateUserDto)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateUserDto[key];
        return obj;
      }, {});

    // 3) Add photo if file was uploaded
    if (file) {
      const photoPath = await this.imageService.saveImage(file, 'users', {
        userId,
        width: 500,
        height: 500,
        quality: 90,
      });
      // Save the photo path to the user data
      filteredData['photo'] = photoPath;
    }
    // 4) Get user and update
    const user = await this.getUserById(userId);
    Object.assign(user, filteredData);

    // 5) Save and return updated user
    return this.userRepository.save(user);
  }

  async updateUser(
    userId: string,
    updateUserDto: Partial<User>,
  ): Promise<User> {
    const user = await this.getUserById(userId);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);

    // Mark the user as inactive
    user.active = false;

    await this.userRepository.save(user);
  }
}
