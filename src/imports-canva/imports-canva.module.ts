import { Module } from '@nestjs/common';
import { ImportsCanvaService } from './services';
import { ImportsController } from './controllers';

@Module({
  providers: [ImportsCanvaService],
  controllers: [ImportsController],
  exports: [
    ImportsCanvaService
  ]
})
export class ImportsCanvaModule {}
