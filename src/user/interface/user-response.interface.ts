import { User } from "@prisma/client";


export interface IResponseUsers{
  users: User[];
  total: number;
}