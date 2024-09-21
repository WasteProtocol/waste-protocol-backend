import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { Role } from 'src/models/role.enum';

import { FirebaseService } from 'src/utils/firebase/firebase.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Auth(Role.ADMIN)
  @Get(':filename/signed-url')
  async generateSignedUrl(@Param('filename') filename: string): Promise<string> {
    const signedUrl = await this.firebaseService.generateSignedUrl(filename);
    return signedUrl;
  }
}
