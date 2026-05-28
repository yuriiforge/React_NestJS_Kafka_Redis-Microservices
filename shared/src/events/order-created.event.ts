export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  totalPrice: number;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  createdAt: Date;
}
