import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { Trade } from 'src/models/trade.interface';
import { collection, set, get, query, where, update, remove } from 'typesaurus';

@Injectable()
export class TradesService {
  constructor(private readonly paginationService: PaginationService, private readonly uuidService: UuidService) {}
  async create(createTradeDto: CreateTradeDto) {
    const trades = collection<Trade>('trades');
    const id = await this.uuidService.generateUuid();
    const data = {
      ...createTradeDto,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await set(trades, id, data);
    const trade = await get(trades, id);
    return trade.data;
  }

  async findAll(filter: any, filterOrder: any, page: number, limit: number) {
    const trades = collection<Trade>('trades');

    const filterConditions = [];
    Object.keys(filter).forEach((key) => {
      filterConditions.push(where(key, '==', filter[key]));
    });

    // Object.keys(filterOrder).forEach((key) => {
    //   filterConditions.push(order(key, filter[key]));
    // });

    Logger.debug(`filterConditions == %o`, filterConditions);
    const queryTrade = await query(trades, filterConditions);

    const datas = [];
    for (const doc of queryTrade) {
      const u = doc.data;
      datas.push(u);
    }

    const result = {
      results: [],
      page,
      limit,
      totalPages: 0,
      totalResults: 0,
    };
    const totalResults = datas.length;
    const totalPages = Math.ceil(totalResults / limit);
    result.totalResults = totalResults;
    result.totalPages = totalPages;
    result.results = await this.paginationService.paginate(datas, limit, page);
    return result;
  }

  async findOne(id: string) {
    const trades = collection<Trade>('trades');
    const trade = await get(trades, id);
    if (!trade) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'trade not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    const result = trade.data;
    return result;
  }

  async update(id: string, updateTradeDto: UpdateTradeDto) {
    const data = {
      ...updateTradeDto,
      updatedAt: new Date(),
    };
    const trades = collection<Trade>('trades');
    const trade = await get(trades, id);
    if (!trade) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'Trade not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await update(trades, id, data);
    const result = await get(trades, id);
    return result.data;
  }

  async remove(id: string) {
    const trades = collection<Trade>('trades');
    const trade = await get(trades, id);
    if (!trade) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'Trade not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await remove(trades, id);
    return true;
  }
}
