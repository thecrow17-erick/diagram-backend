import { ImportsCanvaService } from './../../imports-canva/services/imports-canva.service';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, Room } from '@prisma/client';
import { QueryCommonDto } from 'src/common/dto';
import { PrismaService } from 'src/prisma/services';
import { CreateRoomDto } from '../dto';
import { UserService } from 'src/user/services';
import { UserRoomService } from './user-room.service';
import { IResponseRoomAll, IUserRoomInvitation } from '../interfaces';

@Injectable()
export class RoomService {
  private characteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; 

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserRoomService))
    private readonly userRoomService: UserRoomService,
    private readonly importsCanvaService:ImportsCanvaService 
  ) {}


  private generateCodeRoom(): string {
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      const indiceAleatorio = Math.floor(Math.random() * this.characteres.length);
      codigo += this.characteres[indiceAleatorio];
    }
    return codigo.toUpperCase();
  }

  public async findInvitation(query: QueryCommonDto, userId: string): Promise<IUserRoomInvitation[]> {
      const findInvitation = await this.prismaService.user_Room.findMany({
        where: {
          AND: [
            {
              user_id: userId
            },
            {
              status: "INVITATION"
            }
          ]
        },
        select: {
          user_id: true,
          role: true,
          status: true,
          createdAt: true,
          room: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
              status: true,
              createdAt: true,
              updatedAt: true 
            }
          }
        },
        take: query.limit,
        skip: query.skip
      });
  
      return findInvitation;
    }
  
    public async countInvitation(userId: string): Promise<number> {
      const findInvitation = await this.prismaService.user_Room.count({
        where: {
          AND: [
            {
              user_id: userId
            },
            {
              status: "INVITATION"
            }
          ]
        }
      });
  
      return findInvitation;
    }

  public async countAll (
    {
      search,
    }: QueryCommonDto,
    userId: string): Promise<number> {
      const findAllRooms = await this.prismaService.user_Room.count({
        where: {
          AND: [
            {
              status: "OFICIAL"
            },
            {
              user_id: userId
            }
          ]
        }
      });
  
      return findAllRooms;
  }

  public async findAllRooms(
    {
      // search,
      skip,
      limit
    }: QueryCommonDto,userId: string): Promise<IResponseRoomAll[]>{
    const findAllRooms = await this.prismaService.user_Room.findMany({
      where: {
        AND: [
          {
            status: "OFICIAL"
          },
          {
            user_id: userId
          }
        ]
      },
      select: {
        role: true,
        status: true,
        createdAt: true,
        room: {
          select:{
            id: true,
            code: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      take: limit,
      skip
    });

    return findAllRooms;
  }


  public async findIdRoom(id: number, select?: Prisma.RoomSelect): Promise<any> {
    const findRoom = await this.prismaService.room.findUnique({
      where: {
        id
      },
      select: select
    });
    if(!findRoom)
      throw new NotFoundException("La sala no se encuentra")

    return findRoom;
  }

  private async findRoomName(name: string){
    const findRoom = await this.prismaService.room.findFirst({
      where: {
        name
      },
    });

    return findRoom;
  }


  public async createRoom(createRoomDto:CreateRoomDto, userId: string): Promise<Room>{
    const findeUser = await this.userService.findIdUser(userId);

    console.log(createRoomDto);
    const findRoomName = await this.findRoomName(createRoomDto.name);
    if(findRoomName)
      throw new BadRequestException("Ingrese otro nombre")

    let data = {};
    if(createRoomDto.sketch){
      data = await this.importsCanvaService.processSketch(createRoomDto.sketch.buffer);
    }
   
    const createRoom = await this.prismaService.room.create({
      data: {
        name: createRoomDto.name,
        description: createRoomDto.description,
        code: this.generateCodeRoom(),
        users:{
          create: {
            user_id: findeUser.id,
            role: "OWNER",
            status: "OFICIAL",
          }
        },
        data
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

    const findUserRoom = await this.userRoomService.findUserRoom(
        findUser.id,
        findIdRoom.id
    );
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

    const findUserRoom = await this.userRoomService.findUserRoom(
      findUser.id,
      findIdRoom.id
    );
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
