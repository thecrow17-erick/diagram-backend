import { Module } from '@nestjs/common';
import { RoomService } from './services/room.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [RoomService],
  imports: [
    PrismaModule,
    AuthModule,
    UserModule
  ]
})
export class RoomModule {}
