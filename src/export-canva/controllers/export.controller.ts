import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ExportService } from '../services';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import * as fse from 'fs-extra';


import {  CreateExportAngularDto } from '../dto';
import {v4 as uuid} from 'uuid'
import * as path from "path";
import { Response } from 'express';

@Controller('export')
export class ExportController {

  constructor(private readonly exportService: ExportService) {}

  @Post("angular")
  @HttpCode(HttpStatus.OK)
  @FormDataRequest({storage: MemoryStoredFile})
  public async exportAngularController(
    @Body() createExportAngularDto:CreateExportAngularDto,
    @Res() res: Response
  ): Promise<any> {
    try {
      const zipBuffer = await this.exportService.generateAngularCode(createExportAngularDto);
      const name = uuid();
      const tempDir = path.join(process.cwd(), 'temp');
      if(!fse.existsSync(tempDir))
        fse.mkdirSync(tempDir,{recursive: true});

      const tempFile = path.join(tempDir, `${name}.zip`);
      fse.writeFileSync(tempFile,zipBuffer);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${name}.zip`);
      res.setHeader('Content-Length', fse.statSync(tempFile).size);
      res.setHeader('Cache-Control', 'no-cache');

      const fileStream = fse.createReadStream(tempFile);
      fileStream.pipe(res);
      
      // Eliminar archivo temporal después de enviarlo
      fileStream.on('end', () => {
          fse.unlinkSync(tempFile);
      });
      
      fileStream.on('error', (err) => {
          console.error('Error durante el streaming del archivo:', err);
          if (fse.existsSync(tempFile)) {
              fse.unlinkSync(tempFile);
          }
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: 'Error generating template'
      });        
    }
  }
}
