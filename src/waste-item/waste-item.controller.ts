import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { WasteItemService } from './waste-item.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { User } from 'firebase/auth';
import { CreateWasteItemDto } from './dto/create-waste-item.dto';
import { UpdateWasteItemDto } from './dto/update-waste-item.dto';

@Controller('waste-item')
export class WasteItemController {
  constructor(private readonly wasteItemService: WasteItemService) {}

  @Auth()
  @Post()
  create(@Body() createTradeDto: CreateWasteItemDto) {
    return this.wasteItemService.create(createTradeDto);
  }

  @Auth()
  @Get()
  async findAll(@Query() query: any, @Req() req) {
    const user: User = req.user;
    const { orderBy, page = 1, limit = 10 } = query;
    const filter = {};
    const order = {};

    if (orderBy) {
      const o = orderBy.split(':');
      Object.assign(order, { [o[0]]: o[1] });
    }

    const result = await this.wasteItemService.findAll(filter, order, Number(page), Number(limit));
    return result;
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const trade = await this.wasteItemService.findOne(id);
    return trade;
  }

  @Auth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateWasteItemDto) {
    const trade = await this.wasteItemService.update(id, body);
    return trade;
  }

  @Auth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.wasteItemService.remove(id);
    return { code: 200, message: 'user deleted' };
  }
}
