import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
