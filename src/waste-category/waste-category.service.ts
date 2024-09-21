import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateWasteCategoryDto } from './dto/create-waste-category.dto';
import { UpdateWasteCategoryDto } from './dto/update-waste-category.dto';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { WasteCategory } from 'src/models/waste-category.interface';
import { collection, set, get, query, where, update, remove } from 'typesaurus';

@Injectable()
export class WasteCategoryService {
  constructor(private readonly paginationService: PaginationService, private readonly uuidService: UuidService) {}
  async create(createWasteCategoryDto: CreateWasteCategoryDto) {
    const wasteCategories = collection<WasteCategory>('waste-categories');
    let id = createWasteCategoryDto.id;
    if (!id) {
      id = await this.uuidService.generateUuid();
    }
    const data = {
      ...createWasteCategoryDto,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await set(wasteCategories, id, data);
    const wasteCategory = await get(wasteCategories, id);
    return wasteCategory.data;
  }

  async findAll(filter: any = {}, filterOrder: any = {}, page = 1, limit = 10) {
    const wasteCategories = collection<WasteCategory>('waste-categories');

    const filterConditions = [];
    Object.keys(filter).forEach((key) => {
      filterConditions.push(where(key, '==', filter[key]));
    });

    // Object.keys(filterOrder).forEach((key) => {
    //   filterConditions.push(order(key, filter[key]));
    // });

    Logger.debug(`filterConditions == %o`, filterConditions);
    const queryWasteCategory = await query(wasteCategories, filterConditions);

    const datas = [];
    for (const doc of queryWasteCategory) {
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
    const wasteCategories = collection<WasteCategory>('waste-categories');
    const wasteCategory = await get(wasteCategories, id);
    if (!wasteCategory) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'wasteCategory not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    const result = wasteCategory.data;
    return result;
  }

  async update(id: string, updateWasteCategoryDto: UpdateWasteCategoryDto) {
    const data = {
      ...updateWasteCategoryDto,
      updatedAt: new Date(),
    };
    const wasteCategories = collection<WasteCategory>('waste-categories');
    const wasteCategory = await get(wasteCategories, id);
    if (!wasteCategory) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'WasteCategory not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await update(wasteCategories, id, data);
    const result = await get(wasteCategories, id);
    return result.data;
  }

  async remove(id: string) {
    const wasteCategories = collection<WasteCategory>('waste-categories');
    const wasteCategory = await get(wasteCategories, id);
    if (!wasteCategory) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'WasteCategory not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await remove(wasteCategories, id);
    return true;
  }
}
