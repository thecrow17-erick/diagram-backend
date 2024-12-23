import { Module } from '@nestjs/common';
import { UserService } from './services';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [UserService],
  imports: [
    PrismaModule
  ]
})
export class UserModule {}