import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TradesService } from 'src/trades/trades.service';
import { WasteItemService } from 'src/waste-item/waste-item.service';

@Injectable()
export class PublicService {
  constructor(
    private configService: ConfigService,
    private readonly wasteItemService: WasteItemService,
    private readonly tradesService: TradesService
  ) {
    Logger.debug(`PublicService constructor`);
  }

  // get total stat from the graph protocol
  async getTotalStat() {
    const query = `
      query {
        tradeTotals {
          carbonEmissionCount
          id
          tradeCount
          usdcCount
        }
      }
    `;
    Logger.debug(`QUERY == ${query}`);
    const requestBody = {
      query: query,
    };

    try {
      const response = await axios.post(
        'https://api.studio.thegraph.com/query/3561/ethglobal2024-waste-protocol/version/latest',
        requestBody
      );
      return response.data.data.tradeTotals;
    } catch (error) {
      console.error(error);
    }
  }

  // get stat buy hour
  async getStatByHour() {
    const query = `
      query {
        tradeHours {
          id
          carbonEmissionCount
          hourStartUnix
          tradeCount
          usdcCount
        }
      }
    `;
    Logger.debug(`QUERY == ${query}`);
    const requestBody = {
      query: query,
    };

    try {
      const response = await axios.post(
        'https://api.studio.thegraph.com/query/3561/ethglobal2024-waste-protocol/version/latest',
        requestBody
      );
      return response.data.data.tradeHours;
    } catch (error) {
      console.error(error);
    }
  }

  // get trades from firestore and calculate
  async getStatByItems() {
    const wasteItemsResult = await this.wasteItemService.findAll({}, {}, 1, 1000);
    const wasteItems = wasteItemsResult.results;

    // get all trades
    const tradeResult = await this.tradesService.findAll({}, {}, 1, 1000);
    const tradeItems = tradeResult.results;

    // for each tradeItems calculate wasteItemId
    const results = {};
    // for each tradeItems
    for (const trade of tradeItems) {
      const tradeItem = trade.items;
      for (const item of tradeItem) {
        let wasteAmountSum = results[item.wasteItemId];
        if (wasteAmountSum) {
          wasteAmountSum += item.amount;
        } else {
          wasteAmountSum = item.amount;
        }
        results[item.wasteItemId] = wasteAmountSum;
      }
    }
    Logger.debug(`results == ${JSON.stringify(results)}`);
    // each key and value from results
    const resultStats = [];
    for (const key in results) {
      Logger.debug(`key == ${key}`);
      const data = results[key];
      Logger.debug(`data == ${JSON.stringify(data)}`);
      const wasteItem = wasteItems.find((wasteItem) => wasteItem.id === key);
      Logger.debug(`wasteItem == ${wasteItem}`);
      resultStats.push({
        name: wasteItem.name,
        amount: data,
      });
    }
    return resultStats;
  }
}
