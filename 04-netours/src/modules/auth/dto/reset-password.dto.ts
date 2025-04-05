import { IsNotEmpty, MinLength, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => o.password)
  @IsNotEmpty()
  passwordConfirm: string;
}
