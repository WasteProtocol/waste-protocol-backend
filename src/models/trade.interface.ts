import { TradeItem } from './trade-item.interface';
import { TradeStatus } from './trade-status.enum'; // Adjust the import path as necessary

export interface Trade {
  id: string;
  address: string;
  approved?: boolean;
  approver?: string;
  rejected?: boolean;
  settled?: boolean;

  items: TradeItem[];

  status: TradeStatus;
  locaton?: string;
  purpose?: string;

  totalTokenReceived?: number;
  totalUSDCReceived?: number;
  totalEmissionAmount?: number;

  submittedTx?: string;
  tradeId?: number;
  approvedTx?: string;

  createdAt: Date;
  updatedAt: Date;
}

/*
struct WasteTrade {
    address user;
    uint256[] wasteTypeIds;
    uint256[] amounts; // Amounts in grams
    bool approved;
    bool rejected;
    bool settled;

    uint256 totalTokenReceived;
    uint256 totalUSDCReceived;
    uint256 totalEmissionAmount;
}
*/
