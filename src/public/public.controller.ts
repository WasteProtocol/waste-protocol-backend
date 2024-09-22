import { Logger } from '@nestjs/common';
import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { PublicService } from './public.service';
import { WasteCategoryService } from 'src/waste-category/waste-category.service';
import { WasteItemService } from 'src/waste-item/waste-item.service';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { UserService } from 'src/user/user.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
// import { SignProtocolService } from 'src/utils/web3/sign-protocol.service';

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
    private readonly uuidService: UuidService,
    private readonly userSerivce: UserService // private readonly signProtocolService: SignProtocolService,
  ) {}

  @Auth()
  @Get('users/me')
  async me(@Req() req: any) {
    const userId = req.user?.id;
    const user = await this.userSerivce.getUser(userId);
    return user;
  }

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

  // get total stat from subgraph
  @Get('stat/total')
  async getTotalStat() {
    const result = await this.publicService.getTotalStat();
    return result[0];
  }

  // get total stat hour
  @Get('stat/hour')
  async getStatByHour() {
    const result = await this.publicService.getStatByHour();
    // for each item, convert dayId to timestamp
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      item.timestamp = item.id * 3600;
    }
    return result;
  }

  @Get('stat/items')
  async getStatByItems() {
    const result = await this.publicService.getStatByItems();
    return result;
  }
}
