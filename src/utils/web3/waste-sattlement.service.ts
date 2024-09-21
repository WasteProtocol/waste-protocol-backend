// service for interface with waste smart contract
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { CHAINS } from 'src/common/configs/constant';

const wasteSattlementContractAddress = '0xdCE2395d97A307c6179f7ee8A7b843c768BE4221';
const wasteSattlementContractABI = [
  'function submitWasteTrade(address userAddress, string[] memory  wasteTypeIds, uint256[] calldata amounts)',
  'function approveTrade(uint256 tradeId) external',
  'event TradeSubmitted(uint256 tradeId, address indexed user)',
  'event TradeApproved(uint256 tradeId, address indexed socialNode)',
  'event TradeRejected(uint256 tradeId, address indexed socialNode)',
  'event TradeSettled(uint256 tradeId, address indexed user, uint256 wasteTokenAmount, uint256 usdcAmount)',
];

const provider = new ethers.providers.JsonRpcProvider(CHAINS.SEPOLIA.rpc);
// TODO change to use env variable
const privateKey = '0x745aadbd77a37bb68bf633fbd4369543324d9efef51e57135a8476b2fa63caa6';
Logger.debug(`privateKey == ${privateKey}`);
// create signer wallet
const signerWallet = new ethers.Wallet(privateKey, provider);

const wasteSattlementContract = new ethers.Contract(
  wasteSattlementContractAddress,
  wasteSattlementContractABI,
  signerWallet
);

@Injectable()
export class WasteSattlementService {
  constructor() {
    Logger.debug(`WasteSattlementService constructor`);
  }

  async submitWasteTrade(userAddress: string, wasteTypeIds: string[], amounts: number[]) {
    Logger.debug(`submitWasteTrade`);
    const tx = await wasteSattlementContract.submitWasteTrade(userAddress, wasteTypeIds, amounts);
    return tx;
  }

  async approveTrade(tradeId: number) {
    Logger.debug(`approveTrade`);
    const tx = await wasteSattlementContract.approveTrade(tradeId);
    return tx;
  }

  async getTradeSubmittedEvent() {
    Logger.debug(`getTradeSubmittedEvent`);
    return wasteSattlementContract.filters.TradeSubmitted();
  }

  async getTradeApprovedEvent() {
    Logger.debug(`getTradeApprovedEvent`);
    return wasteSattlementContract.filters.TradeApproved();
  }
}
