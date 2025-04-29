import { Role, Room, STATUS, User, User_Room } from "@prisma/client";



export interface IReponseUserRoom {
  user_room: User_Room
}

export interface IResponseGetInvitations {
  rooms: IUserRoomInvitation[];
  total: number;
}

export interface IUserRoomInvitation {
  user_id: string;
  role: Role;
  status: STATUS;
  createdAt: Date;
  room: IRoomGet;
}
interface IRoomGet {
  name: string;
  status: boolean;
  createdAt: Date;
  id: number;
  code: string;
  description: string;
  updatedAt: Date;
}