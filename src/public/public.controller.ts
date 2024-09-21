import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { WasteCategoryService } from 'src/waste-category/waste-category.service';
import { WasteItemService } from 'src/waste-item/waste-item.service';
import { UuidService } from 'src/utils/uuid/uuid.service';

@Controller('public')
export class PublicController {
  mockWasteCategory = [
    {
      id: '679fae79-eaca-4460-b612-7f1b1832f3be',
      name: 'plastic',
      emissionRate: 1.03, // gCO2e/g
    },
    {
      id: 'f731c55b-7d66-4e37-8194-c784b22cfe95',
      name: 'paper',
      emissionRate: 3.54, // gCO2e/g
    },
  ];

  mockWasteItem = [
    {
      id: 'b074bb47-46c3-4949-a51c-533e0545030c',
      categoryId: '679fae79-eaca-4460-b612-7f1b1832f3be',
      name: 'Drink Bottle',
      price: 0.5,
    },
    {
      id: '4f8cadb8-284e-42d6-8572-4f4a306bf90f',
      categoryId: '679fae79-eaca-4460-b612-7f1b1832f3be',
      name: 'Milk Bottle',
      price: 0.4,
    },
    {
      id: '8578b67e-7f85-4ae0-ab5d-93dfb26b43e6',
      categoryId: 'f731c55b-7d66-4e37-8194-c784b22cfe95',
      name: 'Newspaper',
      price: 0.2,
    },
    {
      id: '80511cb5-62de-4645-b6e2-e8538633de2b',
      categoryId: 'f731c55b-7d66-4e37-8194-c784b22cfe95',
      name: 'Cardboard box',
      price: 0.1,
    },
  ];

  constructor(
    private readonly publicService: PublicService,
    private readonly wasteCategoryService: WasteCategoryService,
    private readonly wasteItemService: WasteItemService,
    private readonly uuidService: UuidService
  ) {}

  // init function create waste-category and waste-item
  @Get('init')
  async init() {
    // create waste-category
    for (let i = 0; i < this.mockWasteCategory.length; i++) {
      const category = this.mockWasteCategory[i];
      await this.wasteCategoryService.create(category);
    }

    // create waste-item
    for (let i = 0; i < this.mockWasteItem.length; i++) {
      const item = this.mockWasteItem[i];
      await this.wasteItemService.create(item);
    }

    return { code: 200, message: 'init success' };
  }

  // generate random uuid 10 times
  @Get('uuids')
  async generateUuid(@Query() query: any) {
    const amount = query.amount || 10;
    const result = [];
    for (let i = 0; i < amount; i++) {
      const uuid = await this.uuidService.generateUuid();
      result.push(uuid);
    }
    return result;
  }

  // get all waste items
  @Get('waste-items')
  async getWasteItems() {
    const result = await this.wasteItemService.findAll({}, {}, 1, 10);
    return result.results;
  }

  // get waste item by id
  @Get('waste-items/:id')
  async getWasteItem(@Param() params: any) {
    return await this.wasteItemService.findOne(params.id);
  }
}
