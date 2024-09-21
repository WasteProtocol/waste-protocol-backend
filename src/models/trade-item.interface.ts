export interface TradeItem {
  id: string;
  tradeId: string;
  wasteItemId: string;
  amount: number;
  total?: number;
  createdAt: Date;
  updatedAt: Date;
}
