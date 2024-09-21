import { UuidService } from './../utils/uuid/uuid.service';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Role } from 'src/models/role.enum';
import { User } from 'src/models/user.interface';
import { PaginationService } from 'src/utils/pagination/pagination.service';
import { collection, get, query, remove, set, update, where } from 'typesaurus';
import { UpdateUserInput } from './dto/update-user.dto';
import { CreateUserInput } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly paginationService: PaginationService, private readonly uuidService: UuidService) {}

  async createUser(createUserInput: CreateUserInput) {
    const users = collection<User>('users');
    const id = await this.uuidService.generateUuid();
    const data = {
      ...createUserInput,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await set(users, id, data);
    const user = await get(users, id);
    return user.data;
  }

  async getUser(id: string) {
    const users = collection<User>('users');
    const user = await get(users, id);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'user not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    const result = user.data;
    return result;
  }

  async getUsers(filter: any, filterOrder: any, page: number, limit: number) {
    const users = collection<User>('users');

    const filterConditions = [];
    Object.keys(filter).forEach((key) => {
      filterConditions.push(where(key, '==', filter[key]));
    });

    // Object.keys(filterOrder).forEach((key) => {
    //   filterConditions.push(order(key, filter[key]));
    // });

    Logger.debug(`filterConditions == %o`, filterConditions);
    const queryUser = await query(users, filterConditions);

    const datas = [];
    for (const doc of queryUser) {
      const u = doc.data;
      datas.push(u);
    }

    const result = {
      results: [],
      page,
      limit,
      totalPages: 0,
      totalResults: 0,
    };
    const totalResults = datas.length;
    const totalPages = Math.ceil(totalResults / limit);
    result.totalResults = totalResults;
    result.totalPages = totalPages;
    result.results = await this.paginationService.paginate(datas, limit, page);
    return result;
  }

  // async getUsers(filter: any, order: any, page: number, limit: number) {
  //   const users = collection<User>('users');
  //   let queries: any = [];
  //   for (const [key, value] of Object.entries(filter)) {
  //     queries = queries.where(key, '==', value);
  //   }
  //   for (const [key, value] of Object.entries(order)) {
  //     queries = queries.orderBy(key, value);
  //   }
  //   const queryUser = await query(users, [queries]);

  //   const datas = [];
  //   for (const doc of queryUser) {
  //     const u = doc.data;
  //     datas.push(u);
  //   }

  //   const result = {
  //     results: [],
  //     page,
  //     limit,
  //     totalPages: 0,
  //     totalResults: 0,
  //   };
  //   const totalResults = datas.length;
  //   const totalPages = Math.ceil(totalResults / limit);
  //   result.totalResults = totalResults;
  //   result.totalPages = totalPages;
  //   result.results = await this.paginationService.paginate(datas, limit, page);
  //   return result;
  // }

  async updateUser(id: string, updateUserDto: UpdateUserInput): Promise<User> {
    const data = {
      ...updateUserDto,
      updatedAt: new Date(),
    };
    const users = collection<User>('users');
    const user = await get(users, id);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'User not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await update(users, id, data);
    const result = await get(users, id);
    return result.data;
  }

  async deleteUser(id: string) {
    const users = collection<User>('users');
    const user = await get(users, id);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          errors: {
            message: 'User not found',
          },
        },
        HttpStatus.CONFLICT
      );
    }
    await remove(users, id);
    return true;
  }

  async getUserByPublicAddress(publicAddress: string): Promise<User> {
    // Logger.debug(`get user ${publicAddress}`);
    const users = collection<User>('users');
    let user: any;
    const find = await query(users, [where('publicAddress', '==', publicAddress)]);
    // Logger.debug(`find == %o`, find);
    if (find.length == 0) {
      const id = await this.uuidService.generateUuid();
      await set(users, id, { id, publicAddress, role: Role.USER, createdAt: new Date(), updatedAt: new Date() });
      user = await get(users, id);
    } else {
      user = find[0];
    }
    return user.data as User;
  }

  async randomUserNonce(userId: string): Promise<number> {
    const nonce = Math.floor(Math.random() * 10000);
    Logger.debug(`random nonce ${nonce}`);
    const users = collection<User>('users');
    await update(users, userId, { nonce });
    return nonce;
  }

  async updateRole(userId: string, role: Role): Promise<Role> {
    Logger.debug(`update role ${role}`);
    const users = collection<User>('users');
    await update(users, userId, { role });
    return role;
  }
}
