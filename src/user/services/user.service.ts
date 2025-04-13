import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {  User } from '@prisma/client';
import * as bcrypt from "bcrypt";


import { PrismaService } from 'src/prisma/services';
import { UserCreateDto } from '../dto';
import { QueryCommonDto } from 'src/common/dto';
import { IOptionUser } from '../interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService
  ){}



  public async findAllRoom({
      skip,
      limit
    }: QueryCommonDto,
      option?: IOptionUser
  ): Promise<User[]> {
    const findUsers = await this.prismaService.user.findMany({
      where: option.where,
      skip,
      take:limit
    });
    return findUsers;
  }

  public async countAllRoom(
    option?: IOptionUser
  ): Promise<number> {
    const findAll = await this.prismaService.user.count({
      where: option.where
    })
    return findAll;
  }

  public async findAll({
    search,
    skip,
    limit
  }: QueryCommonDto): Promise<User[]> {
    const findAll = await this.prismaService.user.findMany({
      where: {
        username: {
          contains: search,
          mode: "insensitive"
        }
      },
      skip,
      take: limit
    })
    return findAll;
  }

  public async countAll({
    search  
  }: QueryCommonDto): Promise<number> {
    const findAll = await this.prismaService.user.count({
      where: {
        username: {
          contains: search,
          mode: "insensitive"
        }
      }
    })
    return findAll;
  }

  public async createUser(userCreateDto: UserCreateDto): Promise<User>{
    const findUser = await this.findUserEmail(userCreateDto.email);
    if(findUser)
      throw new BadRequestException(`El username ya se encuentra en uso`);
    const createUser = await this.prismaService.user.create({
      data: {
        username: userCreateDto.username,
        email: userCreateDto.email,
        password: this.hashPass(userCreateDto.password),
      }
    })
    return createUser;
  }

  private hashPass(password: string, saltRounds: number = 10): string{
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }

  public async findUser(name: string): Promise<User>{
    const findUser = await this.prismaService.user.findFirst({
      where:{
        username: {
          contains: name,
          mode: 'insensitive'
        }
      }
    });
    return findUser;
  }

  public async findUserEmail(email: string): Promise<User> {
    const findUser = await this.prismaService.user.findFirst({
      where:{
        email
      }
    });
    return findUser;
  }

  public async findIdUser(id: string): Promise<User>{
    const findUser = await this.prismaService.user.findUnique({
      where:{
        id
      }
    });
    if(!findUser)
      throw new NotFoundException(`El usuario ${id} no encontrado`)
    return findUser;
  }
}
