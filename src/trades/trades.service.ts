import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { Trade } from 'src/models/trade.interface';
import { collection, set, get, query, where, update, remove } from 'typesaurus';
import { TradeStatus } from 'src/models/trade-status.enum';
import { WasteItemService } from 'src/waste-item/waste-item.service';
import { WasteSattlementService } from 'src/utils/web3/waste-sattlement.service';
import { SignProtocolService } from 'src/utils/web3/sign-protocol.service';
import { Attestation } from 'src/models/attestation.interface';
import { WasteCategoryService } from 'src/waste-category/waste-category.service';

@Injectable()
export class TradesService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly uuidService: UuidService,
    private readonly wasteCategoryService: WasteCategoryService,
    private readonly wasteItemService: WasteItemService,
    private readonly wasteSattlementService: WasteSattlementService,
    private readonly signProtocolService: SignProtocolService
  ) {}
  async create(createTradeDto: CreateTradeDto) {
    const trades = collection<Trade>('trades');
    const id = await this.uuidService.generateUuid();
    createTradeDto.status = TradeStatus.Pending;
    const calculatedValues = await this.calculateTotalEmissionAndTotalTokenReceived(createTradeDto);
    const data = {
      ...createTradeDto,
      id,
      totalTokenReceived: calculatedValues.totalTokenReceived,
      totalUSDCReceived: calculatedValues.totalUSDCReceived,
      totalEmissionAmount: calculatedValues.totalEmissionAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // call the blockchain to submitWasteTrade
      const submitTx = await this.wasteSattlementService.submitWasteTrade(
        createTradeDto.address,
        createTradeDto.items.map((item) => item.wasteItemId),
        createTradeDto.items.map((item) => item.amount)
      );

      const receipt = await submitTx.wait();
      Logger.debug(`receipt == %o`, receipt);

      // filter event TradeSubmitted
      const event = receipt.events.find((event) => event.event === 'TradeSubmitted');

      // get the tradeId from the event
      const tradeId = event.args[0].toNumber();

      data.tradeId = tradeId;

      data.submittedTx = submitTx.hash;

      await set(trades, id, data);
      const trade = await get(trades, id);

      return {
        trade: trade.data,
        message: 'Trade created successfully',
        tx: submitTx,
        tradeId,
      };
    } catch (error) {
      Logger.error(`Error submitting trade to blockchain: %o`, error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            message: 'Error submitting trade to blockchain',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // calculate total emission and total token received
  async calculateTotalEmissionAndTotalTokenReceived(trade: CreateTradeDto) {
    let totalEmissionAmount = 0;
    let totalTokenReceived = 0;
    let totalUSDCReceived = 0;
    const tradeCategories = await this.wasteCategoryService.getWasteCategories();
    Logger.debug(`tradeCategories == %o`, tradeCategories);
    const wasteItems = await this.wasteItemService.getAllWasteItems();
    Logger.debug(`wasteItems == %o`, wasteItems);

    for (const item of trade.items) {
      const wasteItem = wasteItems.find((wasteItem) => wasteItem.id === item.wasteItemId);
      const wasteCategory = tradeCategories.find((category) => category.id === wasteItem.categoryId);
      totalEmissionAmount += wasteCategory.emissionRate * item.amount;
      totalTokenReceived += wasteCategory.emissionRate * item.amount;
      totalUSDCReceived += item.amount * wasteItem.price; // 0.1 is the price per gram
    }

    return {
      totalEmissionAmount,
      totalTokenReceived,
      totalUSDCReceived,
    };
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

  // approve trade by tradeId
  async approveTrade(tradeId: number) {
    const trades = collection<Trade>('trades');
    const trade = await query(trades, [where('tradeId', '==', tradeId)]);
    if (trade.length === 0) {
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

    // call the blockchain to approveTrade
    const approveTx = await this.wasteSattlementService.approveTrade(tradeId);

    const tradeData = trade[0].data;
    tradeData.approved = true;
    tradeData.approvedTx = approveTx.hash;
    tradeData.updatedAt = new Date();
    tradeData.status = TradeStatus.Approved;
    tradeData.approvedAt = new Date();

    await update(trades, trade[0].ref.id, tradeData);

    return tradeData;
  }

  // issue attestation by id
  async issueAttestation(id: string) {
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
    // convert trade to Attestation
    const data = trade.data;
    const attestation: Attestation = {
      id: data.id,
      address: data.address,
      approver: data.approver,
      wasteTypeIds: data.items.map((item) => item.wasteItemId),
      amounts: data.items.map((item) => item.amount.toString()),
      status: data.status,
      totalTokenReceived: data.totalTokenReceived,
      totalUSDCReceived: data.totalUSDCReceived,
      totalEmissionAmount: data.totalEmissionAmount,
      submittedTx: data.submittedTx,
      approvedTx: data.approvedTx,
      tradeId: data.tradeId,
      approvedAt: data.approvedAt.getTime(),
      tradedAt: data.createdAt.getTime(),
    };

    // call the blockchain to issueAttestation
    const issueAttestationTx = await this.signProtocolService.issueAttestation(attestation);
    Logger.debug(`issueAttestationTx == %o`, issueAttestationTx);
  }
}
