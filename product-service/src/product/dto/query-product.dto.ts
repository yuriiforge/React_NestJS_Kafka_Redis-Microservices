import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryProductDto {
  @ApiPropertyOptional({ example: 'headphones' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  inStock?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
