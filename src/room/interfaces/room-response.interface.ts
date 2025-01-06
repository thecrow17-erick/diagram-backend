import { Room } from "@prisma/client";


export interface IResponseRooms { 
  total: number;
  rooms: Room[];
}


export interface IResponseRoom { 
  room: Room;
}