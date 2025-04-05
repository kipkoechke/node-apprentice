import { IsEmail, IsNotEmpty, MinLength, ValidateIf } from 'class-validator';
import { Column } from 'typeorm';
import { Role } from '../../../modules/users/enums/role.enum';

export class SignupDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => o.password)
  @IsNotEmpty()
  passwordConfirm: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;
}
