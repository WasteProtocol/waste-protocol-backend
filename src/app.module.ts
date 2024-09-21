import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GqlConfigService } from './gql-config.service';
import { FirebaseService } from './utils/firebase/firebase.service';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { TradesModule } from './trades/trades.module';
import { WasteCategoryModule } from './waste-category/waste-category.module';
import { WasteItemModule } from './waste-item/waste-item.module';
import { PublicModule } from './public/public.module';
import config from 'src/common/configs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),
    AuthModule,
    UserModule,
    UploadModule,
    TradesModule,
    WasteCategoryModule,
    WasteItemModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver, FirebaseService],
})
export class AppModule {}
