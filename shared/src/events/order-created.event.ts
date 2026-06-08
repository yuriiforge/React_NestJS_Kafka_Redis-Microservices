export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: string;
}
