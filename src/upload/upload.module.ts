import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { FirebaseService } from 'src/utils/firebase/firebase.service';

@Module({
  controllers: [UploadController],
  providers: [FirebaseService],
})
export class UploadModule {}
