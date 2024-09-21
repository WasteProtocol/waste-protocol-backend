import { Module } from '@nestjs/common';
import { WasteCategoryService } from './waste-category.service';
import { WasteCategoryController } from './waste-category.controller';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { UuidService } from 'src/utils/uuid/uuid.service';

@Module({
  controllers: [WasteCategoryController],
  providers: [WasteCategoryService, PaginationService, UuidService],
})
export class WasteCategoryModule {}
