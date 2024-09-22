import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { WasteCategoryService } from 'src/waste-category/waste-category.service';
import { WasteItemService } from 'src/waste-item/waste-item.service';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UserService } from 'src/user/user.service';
import { TradesService } from 'src/trades/trades.service';
import { WasteSattlementService } from 'src/utils/web3/waste-sattlement.service';
import { SignProtocolService } from 'src/utils/web3/sign-protocol.service';

@Module({
  controllers: [PublicController],
  providers: [
    PublicService,
    WasteCategoryService,
    WasteItemService,
    UuidService,
    PaginationService,
    UserService,
    TradesService,
    WasteSattlementService,
    SignProtocolService,
  ],
})
export class PublicModule {}
