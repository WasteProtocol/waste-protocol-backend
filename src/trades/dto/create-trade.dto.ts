import { IsString } from 'class-validator';
import { TradeItem } from 'src/models/trade-item.interface';

export class CreateTradeDto {
  @IsString()
  address: string;

  items: TradeItem[];
  createdAt: Date;
  updatedAt: Date;
}
