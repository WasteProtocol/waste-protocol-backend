import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WasteItem } from 'src/models/waste-item.interface';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { collection, set, where, query, update, remove, get } from 'typesaurus';
import { CreateWasteItemDto } from './dto/create-waste-item.dto';
import { UpdateWasteItemDto } from './dto/update-waste-item.dto';

@Injectable()
export class WasteItemService {
  constructor(private readonly paginationService: PaginationService, private readonly uuidService: UuidService) {}
  async create(createWasteItemDto: CreateWasteItemDto) {
    const wasteItems = collection<WasteItem>('waste-items');
    const id = await this.uuidService.generateUuid();
    const data = {
      ...createWasteItemDto,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await set(wasteItems, id, data);
    const wasteItem = await get(wasteItems, id);
    return wasteItem.data;
  }

  async findAll(filter: any, filterOrder: any, page: number, limit: number) {
    const wasteItems = collection<WasteItem>('wasteItems');

    const filterConditions = [];
    Object.keys(filter).forEach((key) => {
      filterConditions.push(where(key, '==', filter[key]));
    });

    // Object.keys(filterOrder).forEach((key) => {
    //   filterConditions.push(order(key, filter[key]));
    // });

    Logger.debug(`filterConditions == %o`, filterConditions);
    const queryWasteItem = await query(wasteItems, filterConditions);

    const datas = [];
    for (const doc of queryWasteItem) {
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
    const wasteItems = collection<WasteItem>('wasteItems');
    const wasteItem = await get(wasteItems, id);
    if (!wasteItem) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'wasteItem not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    const result = wasteItem.data;
    return result;
  }

  async update(id: string, updateWasteItemDto: UpdateWasteItemDto) {
    const data = {
      ...updateWasteItemDto,
      updatedAt: new Date(),
    };
    const wasteItems = collection<WasteItem>('wasteItems');
    const wasteItem = await get(wasteItems, id);
    if (!wasteItem) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'WasteItem not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await update(wasteItems, id, data);
    const result = await get(wasteItems, id);
    return result.data;
  }

  async remove(id: string) {
    const wasteItems = collection<WasteItem>('wasteItems');
    const wasteItem = await get(wasteItems, id);
    if (!wasteItem) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'WasteItem not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await remove(wasteItems, id);
    return true;
  }
}
