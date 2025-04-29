import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig, envSchema } from './configuration';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { MailModule } from './mail/mail.module';
import { ImportsCanvaModule } from './imports-canva/imports-canva.module';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { OpenaiModule } from './openai/openai.module';
import { ExportCanvaModule } from './export-canva/export-canva.module';

@Module({
  imports: [
    PrismaModule, 
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfig],
      validationSchema: envSchema
    }),
    NestjsFormDataModule.configAsync({
      useFactory: ()=>({
        storage: FileSystemStoredFile,
        fileSystemStoragePath: '/tmp',
      }),
      isGlobal: true,
    }),
    CommonModule,
    AuthModule,
    RoomModule,
    MailModule,
    ImportsCanvaModule,
    OpenaiModule,
    ExportCanvaModule,
  ],
  providers: [],
})
export class AppModule {}
