import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services';
import { UserService } from 'src/user/services';
import { RoomService } from './room.service';
import { User_Room } from '@prisma/client';
import { AddUserRoomDto } from '../dto';
import { MailService } from 'src/mail/services';

@Injectable()
export class UserRoomService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    private readonly mailService: MailService
  ) {}


  


  public async findUserRoom(
    userId: string,
    roomId: number
  ):Promise<User_Room> {
    const findUserRoom = await this.prismaService.user_Room.findFirst({
      where:{
        room_id: roomId,
        user_id: userId
      }
    });
    return findUserRoom;
  }  

  public async invitationUserRoom(
    addUserRoomDto: AddUserRoomDto,
    roomId: number
  ): Promise<User_Room>{
    const findUser = await this.userService.findIdUser(addUserRoomDto.userId);
    const findRoom =  await this.roomService.findIdRoom(roomId);
    try {
      const createInvitation = await this.prismaService.$transaction(async (t) => {
        await this.mailService.sendInvitationRoom({
          room: findRoom,
          user: findUser
        });

        const createInvitationRoom = await t.user_Room.create({
          data: {
            room_id: findRoom.id,
            user_id: findUser.id,
            role: addUserRoomDto.role,
            status: "INVITATION"            
          }
        })

        return createInvitationRoom;
      });
      return createInvitation;
    } catch (err) {
      throw new InternalServerErrorException("Ocurrio un error inesperador: ", err)
    }
  }

  // public async addUserRoom(
  //   addUserRoomDto: AddUserRoomDto,
  //   ownerId: string
  // ):Promise<User_Room> {
  //   const findUser = await this.userService.findIdUser(addUserRoomDto.userId);
    
  //   const findRoom = await this.roomService.findIdRoom(addUserRoomDto.roomId);

  //   const findUserRoom = await this.findUserRoom(
  //     addUserRoomDto.userId,
  //     addUserRoomDto.roomId
  //   );

  //   if(findUserRoom)
  //     throw new BadRequestException("El usuario ya pertenece a esta sala");

  //   const findOwner = await this.findUserRoom(ownerId,findRoom.id);

  //   if(!findOwner || findOwner.role === "MEMBER")
  //     throw new UnauthorizedException("No puede agregar a nadie a la sala")


  //   const createUserRoom = await this.prismaService.user_Room.create({
  //     data: {
  //       user_id: findUser.id,
  //       room_id: findRoom.id,
  //       role: addUserRoomDto.role
  //     }
  //   })
  //   return createUserRoom;
  // }

  // public async deleteUserRoom(
  //   userId: string, 
  //   ownerId: string, 
  //   roomId: number
  // ): Promise<User_Room> {
  //   const findRoom = await this.roomService.findIdRoom(roomId);

  //   const findUser = await this.userService.findIdUser(userId);

  //   const [findUserRoom, findOwnerRoom] = await Promise.all([
  //     this.findUserRoom(findUser.id,findRoom.id),
  //     this.findUserRoom(ownerId,findRoom.id)
  //   ]);

  //   if(!findUserRoom)
  //     throw new BadRequestException("El usuario no pertene a esta sala para eliminarlo")

  //   if(!findOwnerRoom || findOwnerRoom.role !== "OWNER")
  //     throw new UnauthorizedException("Usted no esta autorizado para eliminar este usuario de la sala")

  //   const deleteUserRoom = await this.prismaService.user_Room.delete({
  //     where: {
  //       user_id_room_id: {
  //         user_id: findUser.id,
  //         room_id: findRoom.id
  //       }
  //     }
  //   });
  //   return deleteUserRoom;
  // }

}
