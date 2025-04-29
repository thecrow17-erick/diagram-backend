import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CORS } from './constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("api");
  app.enableCors(CORS)
  await app.listen(port, ()=> {
    Logger.log(`Server in port ${port}`)
  });
}
bootstrap();
