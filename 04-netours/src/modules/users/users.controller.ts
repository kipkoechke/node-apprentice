import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly UserService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return this.UserService.getUserById(user.id);
  }

  @Patch('updateMe')
  @UseInterceptors(FileInterceptor('photo'))
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updatedUser = await this.UserService.updateMe(
      user.id,
      updateUserDto,
      file,
    );

    return {
      status: 'success',
      data: { user: updatedUser },
    };
  }

  @Delete('deleteMe')
  async deleteMe(@CurrentUser() user: User) {
    return this.UserService.deleteUser(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.UserService.getAllUsers();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createUser(@Body() userData: Partial<User>) {
    return this.UserService.createUser(userData);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getUser(@Param('id') id: string) {
    return this.UserService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.UserService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.UserService.deleteUser(id);
  }
}
