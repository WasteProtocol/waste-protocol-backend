import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PublicService {
  constructor(private configService: ConfigService) {
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
}
