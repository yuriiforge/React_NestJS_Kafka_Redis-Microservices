import { IsString, IsNumber, IsInt, IsBoolean, IsOptional, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
