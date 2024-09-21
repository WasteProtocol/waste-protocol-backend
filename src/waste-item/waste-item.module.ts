import { Module } from '@nestjs/common';
import { WasteItemService } from './waste-item.service';
import { WasteItemController } from './waste-item.controller';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';

@Module({
  controllers: [WasteItemController],
  providers: [WasteItemService, PaginationService, UuidService],
})
export class WasteItemModule {}
