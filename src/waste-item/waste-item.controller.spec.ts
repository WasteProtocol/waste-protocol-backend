import { Test, TestingModule } from '@nestjs/testing';
import { WasteItemController } from './waste-item.controller';
import { WasteItemService } from './waste-item.service';

describe('WasteItemController', () => {
  let controller: WasteItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteItemController],
      providers: [WasteItemService],
    }).compile();

    controller = module.get<WasteItemController>(WasteItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
