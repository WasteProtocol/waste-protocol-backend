import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';

@Module({
  controllers: [TradesController],
  providers: [TradesService, PaginationService, UuidService],
})
export class TradesModule {}
