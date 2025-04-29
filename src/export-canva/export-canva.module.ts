import { Logger, Module } from '@nestjs/common';
import { ExportService } from './services';
import { ImportsCanvaModule } from 'src/imports-canva/imports-canva.module';
import { ExportController } from './controllers/export.controller';

@Module({
  providers: [ExportService],
  imports: [
    ImportsCanvaModule
  ],
  controllers: [ExportController]
})
export class ExportCanvaModule {}
