// InsertOrderItem type for creating new order items (without id field)
export interface InsertOrderItem {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}
