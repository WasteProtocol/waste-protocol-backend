import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { User } from 'src/models/user.interface';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Auth()
  @Post()
  create(@Body() createTradeDto: CreateTradeDto, @Query() query: any, @Req() req) {
    const user: User = req.user;
    createTradeDto.address = user.publicAddress;
    return this.tradesService.create(createTradeDto);
  }

  @Auth()
  @Get()
  async findAll(@Query() query: any, @Req() req) {
    const user: User = req.user;
    const { orderBy, page = 1, limit = 10 } = query;
    const filter = { address: user.publicAddress };
    const order = {};

    if (orderBy) {
      const o = orderBy.split(':');
      Object.assign(order, { [o[0]]: o[1] });
    }

    const result = await this.tradesService.findAll(filter, order, Number(page), Number(limit));
    return result;
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const trade = await this.tradesService.findOne(id);
    return trade;
  }

  @Auth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTradeDto) {
    const trade = await this.tradesService.update(id, body);
    return trade;
  }

  @Auth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tradesService.remove(id);
    return { code: 200, message: 'user deleted' };
  }
}
