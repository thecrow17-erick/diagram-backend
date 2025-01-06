import { Module } from '@nestjs/common';
import { RoomService,UserRoomService } from './services';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { RoomController } from './controllers/room.controller';
import { UserRoomController } from './controllers/user-room.controller';

@Module({
  providers: [RoomService, UserRoomService],
  imports: [
    PrismaModule,
    AuthModule,
    UserModule
  ],
  controllers: [RoomController, UserRoomController]
})
export class RoomModule {}
