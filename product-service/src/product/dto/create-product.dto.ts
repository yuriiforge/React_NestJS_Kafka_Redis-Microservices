import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, IsBoolean, IsOptional, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'High-quality wireless headphones with noise cancellation', minLength: 10 })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
