import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get all users (admin-only functionality)
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Create a new user (admin-only functionality)
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Update user details
   */
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getUserById(userId);

    // Update user fields
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  /**
   * Soft delete a user (mark as inactive)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);

    // Mark the user as inactive
    user.active = false;

    await this.userRepository.save(user);
  }
}
