import { IsString } from 'class-validator';
import { TradeItem } from 'src/models/trade-item.interface';
import { TradeStatus } from 'src/models/trade-status.enum';

export class CreateTradeDto {
  @IsString()
  address: string;

  items: TradeItem[];
  status: TradeStatus.Pending;
  createdAt: Date;
  updatedAt: Date;
}
