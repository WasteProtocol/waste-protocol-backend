import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SecurityConfig } from 'src/common/configs/config.interface';
import { Token } from '../models/token.interface';
import { User } from '../models/user.interface';
import { collection, get } from 'typesaurus';
import { SigninPublicAddressInput } from './dto/singin-public-address.input';
import { UserService } from 'src/user/user.service';
import { AuthenticationPubliAddressInput } from './dto/auth-public-address.input';
import * as ethUtil from 'ethereumjs-util';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {}

  async mockSignIn(payload: any) {
    const { publicAddress } = payload;
    const user: User = await this.userService.getUserByPublicAddress(publicAddress);
    if (user) {
      const tokens = await this.generateTokens({ userId: user.id });
      return { user, tokens };
    } else {
      throw new Error('not found or error on create public address');
    }
  }

  async singinWithPublicAddress(payload: SigninPublicAddressInput) {
    const { publicAddress } = payload;
    try {
      const user: User = await this.userService.getUserByPublicAddress(publicAddress);
      const nonce: number = await this.userService.randomUserNonce(user.id);
      if (user) {
        const result = {
          status: 200,
          message: 'success update nonce',
          data: {
            nonce: nonce,
            msg: `Onetime singin with OTP: ${nonce}`,
          },
        };
        return result;
      } else {
        throw new Error('not found or error on create public address');
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async authenticationWithPublicAddress(payload: AuthenticationPubliAddressInput) {
    const { publicAddress, signature } = payload;
    // eslint-disable-next-line prefer-const
    let user: User = await this.userService.getUserByPublicAddress(publicAddress);
    if (user) {
      const msg = `Onetime singin with OTP: ${user.nonce}`;
      Logger.debug(`current sign ${msg}`);
      const msgBuffer = ethUtil.toBuffer(ethUtil.bufferToHex(Buffer.from(msg, 'utf8')));
      Logger.debug(`buffer: ${msgBuffer}`);
      const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
      const signatureBuffer: any = ethUtil.toBuffer(signature);
      const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
      const publicKey = ethUtil.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
      const addressBuffer = ethUtil.publicToAddress(publicKey);
      const address = ethUtil.bufferToHex(addressBuffer);
      if (address.toLowerCase() === publicAddress.toLowerCase()) {
        await this.userService.randomUserNonce(user.id);
        const tokens = this.generateTokens({ userId: user.id });
        return {
          status: 200,
          message: 'success authentication with publicAddress',
          data: {
            user,
            tokens,
          },
        };
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            errors: {
              message: 'Incorrect public address and nonce',
            },
          },
          HttpStatus.UNAUTHORIZED
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            message: 'Not found user, Plsease create it before authentication',
          },
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async validateUser(userId: any) {
    if (userId == null || userId == undefined) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'Validate user fail',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    const users = collection<User>('users');
    const user = await get(users, userId);
    if (user) {
      return user.data;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'Validate user fail',
          },
        },
        HttpStatus.CONFLICT
      );
    }
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }
}
