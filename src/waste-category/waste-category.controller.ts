import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { WasteCategoryService } from './waste-category.service';
import { CreateWasteCategoryDto } from './dto/create-waste-category.dto';
import { UpdateWasteCategoryDto } from './dto/update-waste-category.dto';
import { User } from 'firebase/auth';
import { Auth } from 'src/auth/decorator/auth.decorator';

@Controller('waste-categories')
export class WasteCategoryController {
  constructor(private readonly wasteCategoryService: WasteCategoryService) {}

  @Auth()
  @Post()
  create(@Body() createTradeDto: CreateWasteCategoryDto) {
    return this.wasteCategoryService.create(createTradeDto);
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

    const result = await this.wasteCategoryService.findAll(filter, order, Number(page), Number(limit));
    return result;
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const trade = await this.wasteCategoryService.findOne(id);
    return trade;
  }

  @Auth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateWasteCategoryDto) {
    const trade = await this.wasteCategoryService.update(id, body);
    return trade;
  }

  @Auth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.wasteCategoryService.remove(id);
    return { code: 200, message: 'user deleted' };
  }
}
