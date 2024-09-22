import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';
import { WasteCategoryService } from 'src/waste-category/waste-category.service';
import { WasteItemService } from 'src/waste-item/waste-item.service';
import { WasteSattlementService } from 'src/utils/web3/waste-sattlement.service';
import { SignProtocolService } from 'src/utils/web3/sign-protocol.service';

@Module({
  controllers: [TradesController],
  providers: [
    TradesService,
    PaginationService,
    UuidService,
    WasteCategoryService,
    WasteItemService,
    WasteSattlementService,
    SignProtocolService,
  ],
})
export class TradesModule {}
