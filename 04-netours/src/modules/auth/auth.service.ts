import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { EmailService } from 'src/common/services/email.services';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ user: User; token: string }> {
    const { password, passwordConfirm, ...userData } = signupDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.userRepository.create({
      ...userData,
      password,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.signToken(savedUser.id);

    // Send welcome email
    const url = `${this.configService.get('APP_URL')}/me`;
    await this.emailService.sendWelcome(savedUser, url);

    // Remove password from response
    const { password: _, ...userResponse } = savedUser;

    return {
      user: userResponse as User,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'role', 'photo', 'password'], // Need to explicitly select password as it's excluded by default
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    // Generate JWT token
    const token = this.signToken(user.id);

    // Remove password from the response
    const { password: _, ...userResponse } = user;

    return {
      user: userResponse as User,
      token,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('There is no user with that email address');
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to passwordResetToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time - 10 minutes
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepository.save(user);

    try {
      // Send password reset email
      const resetURL = `${this.configService.get('APP_URL')}/reset-password/${resetToken}`;
      await this.emailService.sendPasswordReset(user, resetURL);

      return {
        status: 'success',
        message: 'Token sent to email',
      };
    } catch (error) {
      // If error occurs, reset the tokens and save
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.userRepository.save(user);

      throw new BadRequestException(
        'There was an error sending the email. Try again later',
      );
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { password, passwordConfirm } = resetPasswordDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with token that hasn't expired yet
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token is invalid or has expired');
    }

    // Update user with new password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date(Date.now() - 1000); // -1s to ensure token is created after the password change

    const updatedUser = await this.userRepository.save(user);

    // Sign token and send it back
    const jwtToken = this.signToken(updatedUser.id);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    return {
      user: userResponse as User,
      token: jwtToken,
    };
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, password, passwordConfirm } = updatePasswordDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'role', 'photo', 'password'], // Need to explicitly select password
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current password is correct
    if (!(await user.validatePassword(currentPassword))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = password;
    user.passwordChangedAt = new Date(Date.now() - 1000); // -1s to ensure token is created after the password change

    const updatedUser = await this.userRepository.save(user);

    // Generate new token
    const token = this.signToken(updatedUser.id);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    return {
      user: userResponse as User,
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  private signToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
