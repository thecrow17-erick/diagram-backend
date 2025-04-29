import { forwardRef, Module } from '@nestjs/common';
import { RoomService,UserRoomService } from './services';
import { RoomController, UserRoomController } from './controllers';

import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { CanvasGateway } from './gateways/canvas.gateway';
import { ImportsCanvaModule } from 'src/imports-canva/imports-canva.module';

@Module({
  providers: [RoomService, UserRoomService, CanvasGateway],
  imports: [
    PrismaModule,
    forwardRef( () => AuthModule),
    forwardRef( () => UserModule),
    MailModule,
    ImportsCanvaModule
  ],
  controllers: [RoomController, UserRoomController],
  exports: [
    UserRoomService
  ]
})
export class RoomModule {}
