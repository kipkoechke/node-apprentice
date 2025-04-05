import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../users/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get the current user's profile
   */
  @Get('me')
  async getMe(@GetUser() user: User) {
    return this.usersService.getUserById(user.id);
  }

  /**
   * Update the current user's profile
   */
  @Patch('updateMe')
  async updateMe(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, updateUserDto);
  }

  /**
   * Soft delete the current user's account
   */
  @Delete('deleteMe')
  async deleteMe(@GetUser() user: User) {
    return this.usersService.deleteUser(user.id);
  }

  /**
   * Admin-only: Get all users
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * Admin-only: Create a new user
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createUser(@Body() userData: Partial<User>) {
    return this.usersService.createUser(userData);
  }

  /**
   * Admin-only: Get a user by ID
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  /**
   * Admin-only: Update a user by ID
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  /**
   * Admin-only: Delete a user by ID
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
