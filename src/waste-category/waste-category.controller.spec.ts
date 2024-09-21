import { Test, TestingModule } from '@nestjs/testing';
import { WasteCategoryController } from './waste-category.controller';
import { WasteCategoryService } from './waste-category.service';

describe('WasteCategoryController', () => {
  let controller: WasteCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteCategoryController],
      providers: [WasteCategoryService],
    }).compile();

    controller = module.get<WasteCategoryController>(WasteCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
