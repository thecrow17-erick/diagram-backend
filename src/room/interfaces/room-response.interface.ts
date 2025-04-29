import { $Enums, Role, Room, STATUS, User, User_Room } from "@prisma/client";


export interface IResponseRooms { 
  total: number;
  rooms: IResponseRoomAll[];
}


export interface IResponseRoom { 
  room: Room;
}

export interface IResponseRoomAll {
  role:       $Enums.Role;
  status:     $Enums.STATUS;
  createdAt:  Date;
  room:       IRoomFirst;
}


interface IRoomFirst {
  name: string;
  id: number;
  code: string;
  description: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUsersRoomRole {
  role:         Role;
  createdAt:    Date;
}

export interface IResponseRoomId{
  room: IRoomID;
}
 
interface IRoomID {
  id:          number;
  name:        string;
  description: string;
  code:        string;
  status:      boolean;
  createdAt:   Date;
  updatedAt:   Date;
  users:       UserElement[];
}

interface UserElement extends User_Room {
  user:      User;
}


