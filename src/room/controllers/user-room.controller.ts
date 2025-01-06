import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenGuard } from 'src/auth/guard';
import { QueryCommonDto } from 'src/common/dto';
import { IApiResponse } from 'src/common/interface';
import { IResponseUsers } from 'src/user/interface';
import { UserService } from 'src/user/services';
import { AddUserRoomDto } from '../dto';
import { IReponseUserRoom } from '../interfaces/user-room-response.interface';
import { UserRoomService } from '../services';

@Controller('user-room')
@UseGuards(AuthTokenGuard)
export class UserRoomController {
  constructor(
    private readonly userService: UserService,
    private readonly userRoomService: UserRoomService
  ) {}


  @Get("search-user")
  @HttpCode(HttpStatus.OK)
  public async findUser(
    @Query() query: QueryCommonDto
  ): Promise<IApiResponse<IResponseUsers>>{
    const statusCode = HttpStatus.OK;
    const [users, total] = await Promise.all([
      this.userService.findAll(query),
      this.userService.countAll(query)
    ])
    return {
      statusCode,
      message: "Los usuarios buscados",
      data: {
        total,
        users
      }
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async addUserRoom(
    @Body() addUserRoomDto:AddUserRoomDto,
    @Req() req: Request
  ): Promise<IApiResponse<IReponseUserRoom>> {
    const statusCode = HttpStatus.CREATED;
    const {user_id} = req;
    const userRomm = await this.userRoomService.addUserRoom(addUserRoomDto,user_id);

    return {
      statusCode,
      message: "Se agrego al usuario en la sala",
      data:{
        user_room: userRomm
      }
    }
  }

}
