import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Room } from '@prisma/client';
import { QueryCommonDto } from 'src/common/dto';
import { PrismaService } from 'src/prisma/services';
import { CreateRoomDto } from '../dto';
import { UserService } from 'src/user/services';

@Injectable()
export class RoomService {
  private characteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService
  ) {}


  private generateCodeRoom(): string {
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      const indiceAleatorio = Math.floor(Math.random() * this.characteres.length);
      codigo += this.characteres[indiceAleatorio];
    }
    return codigo.toUpperCase();
  }

  public async findAll({
    search,
    limit,
    skip
  }: QueryCommonDto): Promise<Room[]>{
    const findAllRoom = await this.prismaService.room.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive"
        }
      },
      take: limit,
      skip
    })
    return findAllRoom;
  }



  public async findIdRoom(id: number): Promise<Room> {
    const findRoom = await this.prismaService.room.findUnique({
      where: {
        id
      }
    });
    if(!findRoom)
      throw new NotFoundException("La sala no se encuentra")

    return findRoom;
  }

  private async findRoomName(name: string){
    const findRoom = await this.prismaService.room.findFirst({
      where: {
        name
      }
    });

    return findRoom;
  }


  public async createRoom(createRoomDto:CreateRoomDto, userId: string): Promise<Room>{
    const findeUser = await this.userService.findIdUser(userId);

    const findRoomName = await this.findRoomName(createRoomDto.name);
    if(findRoomName)
      throw new BadRequestException("Ingrese otro nombre")

    const createRoom = await this.prismaService.room.create({
      data: {
        name: createRoomDto.name,
        description: createRoomDto.description,
        code: this.generateCodeRoom(),
        users:{
          create: {
            user_id: findeUser.id,
            role: "OWNER"
          }
        }
      }
    })

    return createRoom;
  }

  public async updateRoom(id:number, createRoomDto:CreateRoomDto, userId: string): Promise<Room>{
    const findUser = await this.userService.findIdUser(userId);

    const findIdRoom = await this.findIdRoom(id);

    const findRoomName = await this.prismaService.room.findMany({
      where: {
        AND: [
          {
            id: {
              not: findIdRoom.id
            }
          },
          {
            name: createRoomDto.name
          }
        ]
      }
    })
    if(findRoomName.length)
      throw new BadRequestException("Ingrese otro nombre")

    const findUserRoom = await this.prismaService.user_Room.findFirst({
      where:{
        room_id: findIdRoom.id,
        user_id: findUser.id
      }
    });
    if(!findUserRoom || findUserRoom.role !== "OWNER")
      throw new BadRequestException("No puede editar esta sala")

    const updateRoom = await this.prismaService.room.update({
      where: {
        id: findIdRoom.id
      },
      data: {
        name: createRoomDto.name,
        description: createRoomDto.description
      }
    })

    return updateRoom;
  }

  public async updateCodeRoom(id: number,  userId: string): Promise<Room> { 
    const findUser = await this.userService.findIdUser(userId);

    const findIdRoom = await this.findIdRoom(id);

    const findUserRoom = await this.prismaService.user_Room.findFirst({
      where:{
        room_id: findIdRoom.id,
        user_id: findUser.id
      }
    });
    if(!findUserRoom || findUserRoom.role === "COLABORATOR")
      throw new BadRequestException("No puede actualizar el codigo de esta sala")

    const updateCodeRoom = await this.prismaService.room.update({
      where: {
        id: findIdRoom.id
      },
      data: {
        code: this.generateCodeRoom()
      }
    })

    return updateCodeRoom;
  }

}
