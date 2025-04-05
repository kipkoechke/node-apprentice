// email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendWelcome(user: User, url: string): Promise<void> {
    // TODO: Here you would integrate with email sending service
    // Simulation the email sending
    console.log(`Welcome email sent to ${user.email}. URL: ${url}`);

    // TODO: Implement email sending logic here
    // e.g., using nodemailer, sendgrid, etc.
  }

  async sendPasswordReset(user: User, resetURL: string): Promise<void> {
    // Integrate with email sending service
    console.log(
      `Password reset email sent to ${user.email}. Reset URL: ${resetURL}`,
    );

    // TODO: Implement email sending logic here
  }
}
