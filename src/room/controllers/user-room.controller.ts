import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenGuard } from 'src/auth/guard';
import { QueryCommonDto } from 'src/common/dto';
import { IApiResponse } from 'src/common/interface';
import { IResponseUsers } from 'src/user/interface';
import { UserService } from 'src/user/services';
import { AddUserRoomDto } from '../dto';
import { IReponseUserRoom } from '../interfaces/user-room-response.interface';
import { UserRoomService } from '../services';
import { RoomRoleGuard } from 'src/auth/guard/room-role.guard';
import { Roles } from 'src/auth/decorator';

@Controller('user-room/:roomCode')
@UseGuards(AuthTokenGuard)
export class UserRoomController {
  constructor(
    private readonly userService: UserService,
    private readonly userRoomService: UserRoomService
  ) {}


  @Get()
  @HttpCode(HttpStatus.OK)
  public async findUser(
    @Query() query: QueryCommonDto,
    @Param('roomCode', ParseIntPipe) roomId: number
  ): Promise<IApiResponse<IResponseUsers>>{
    const statusCode = HttpStatus.OK;
    const [users, total] = await Promise.all([
      this.userService.findAllRoom(
        query, {
          where: {
            AND: [
              {
                rooms: {
                  none: {
                    room_id: roomId
                  }
                }
              }, 
              {
                username: {
                  contains: query.search,
                  mode: "insensitive"
                }
              }
            ]
          }
        }
      ),
      this.userService.countAllRoom({
        where: {
          AND: [
            {
              rooms: {
                none: {
                  room_id: roomId
                }
              }
            }, 
            {
              username: {
                contains: query.search,
                mode: "insensitive"
              }
            }
          ]
        }
      })
    ])
    return {
      statusCode,
      message: "Los usuarios buscados que no pertenezcan a la sala",
      data: {
        total,
        users
      }
    }
  }

  @Post("invitation")
  @HttpCode(HttpStatus.CREATED)
  @Roles("OWNER","COLABORATOR")
  @UseGuards(RoomRoleGuard)
  public async addUserRoom(
    @Body() addUserRoomDto:AddUserRoomDto,
    @Param('roomCode', ParseIntPipe) roomId: number,
  ): Promise<IApiResponse<IReponseUserRoom>> {
      const statusCode = HttpStatus.CREATED;
      const addUserRoom = await this.userRoomService.invitationUserRoom(addUserRoomDto,roomId);
      return {
        statusCode,
        message: "Usuario agregado correctamente a la sala.",
        data: {
          user_room: addUserRoom
        }
      }
  }

}
