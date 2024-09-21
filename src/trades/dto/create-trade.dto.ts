import { TradeItem } from 'src/models/trade-item.interface';
import { TradeStatus } from 'src/models/trade-status.enum';

export class CreateTradeDto {
  address: string;

  location?: string;
  purpose?: string;

  tradeDate: Date;
  items: TradeItem[];
  status: TradeStatus.Pending;

  submittedTx?: string;
  tradeId?: number;

  createdAt: Date;
  updatedAt: Date;
}
