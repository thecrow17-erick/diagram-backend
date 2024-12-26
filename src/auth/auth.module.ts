import { Module } from '@nestjs/common';
import { AuthService } from './services';
import { AuthController } from './controller/auth.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UserModule,
    PrismaModule,
    JwtModule
  ]
})
export class AuthModule {}
