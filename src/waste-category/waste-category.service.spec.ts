import { Test, TestingModule } from '@nestjs/testing';
import { WasteCategoryService } from './waste-category.service';

describe('WasteCategoryService', () => {
  let service: WasteCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WasteCategoryService],
    }).compile();

    service = module.get<WasteCategoryService>(WasteCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
