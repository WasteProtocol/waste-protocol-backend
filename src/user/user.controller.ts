import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { Role } from 'src/models/role.enum';
import { UserListDto } from './dto/get-list-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { CreateUserInput } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(Role.ADMIN)
  @Post()
  createUser(@Body() createUserInput: CreateUserInput) {
    return this.userService.createUser(createUserInput);
  }

  @Auth(Role.ADMIN)
  @Get()
  async getUsers(@Query() query: any) {
    const { email, mobilePhone, orderBy, page = 1, limit = 10 } = query;
    const filter = {};
    const order = {};

    if (email) {
      Object.assign(filter, { email });
    }
    if (mobilePhone) {
      Object.assign(filter, { mobilePhone });
    }
    if (orderBy) {
      const o = orderBy.split(':');
      Object.assign(order, { [o[0]]: o[1] });
    }

    const result = await this.userService.getUsers(filter, order, Number(page), Number(limit));
    return result;
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);
    return user;
  }

  @Auth(Role.ADMIN)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserInput) {
    const user = await this.userService.updateUser(id, body);
    return user;
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return { code: 200, message: 'user deleted' };
  }
}
