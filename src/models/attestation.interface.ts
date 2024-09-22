import { TradeStatus } from './trade-status.enum';

export interface Attestation {
  id: string;
  address: string;
  approver: string;
  wasteTypeIds: string[];
  amounts: string[];
  status: TradeStatus;
  totalTokenReceived: number;
  totalUSDCReceived: number;
  totalEmissionAmount: number;
  submittedTx: string;
  approvedTx: string;
  tradeId: number;
  approvedAt: number;
  tradedAt: number;
}
