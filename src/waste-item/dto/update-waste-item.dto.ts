import { PartialType } from '@nestjs/swagger';
import { CreateWasteItemDto } from './create-waste-item.dto';

export class UpdateWasteItemDto extends PartialType(CreateWasteItemDto) {}
