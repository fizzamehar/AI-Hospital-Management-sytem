import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // Admin only: create user
  @Post()
  @Roles('ADMIN')
  async create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  // Admin only: get all users
  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.service.findAll();
  }

  // Admin: get user by ID
  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // Admin: update user
  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.service.update(id, body);
  }

  // Admin: delete user
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
