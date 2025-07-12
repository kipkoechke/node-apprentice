import {
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    ArrayMinSize,
  } from 'class-validator';
  
  export class CreateLocationDto {
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsString()
    @IsOptional()
    address?: string;
  
    @IsNumber()
    @IsOptional()
    day?: number;
  
    @IsArray()
    @ArrayMinSize(2)
    @IsNumber({}, { each: true })
    coordinates: number[];
  }
  