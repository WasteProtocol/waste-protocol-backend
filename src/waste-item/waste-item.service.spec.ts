import { Test, TestingModule } from '@nestjs/testing';
import { WasteItemService } from './waste-item.service';

describe('WasteItemService', () => {
  let service: WasteItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WasteItemService],
    }).compile();

    service = module.get<WasteItemService>(WasteItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
