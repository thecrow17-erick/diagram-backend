import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ExportService } from '../services';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { CreateAngularDto, CreateExportAngularDto } from '../dto';

import * as fs from "fs";;
import * as path from "path";
import {v4 as uuid} from "uuid"
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
  ): Promise<void> {
    try {
      // Generar el buffer del ZIP
      const base64Image = createExportAngularDto.photo.buffer.toString('base64');
      const createAngularDto: CreateAngularDto = {
        projectName: "project_ng",
        canvasImage: base64Image,
        projectId: "ugfudsaaa",
        options: {
          cssFramework: "scss",
          generateComponents: true,
          responsiveLayout: true,
          version: "19",
          includeRouting: true,
          name: "project_ng"
        },
      };
      
      const zipBuffer = await this.exportService.generateAngularProject(createAngularDto);
      
      // Generar un nombre de archivo seguro
      const safeFileName = "project_ng"
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-_]/g, '')
          .toLowerCase();
          
      // Crear directorio temporal si no existe
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Guardar archivo ZIP en disco temporalmente
      const uniqueId = uuid();
      const tempFilePath = path.join(tempDir, `${safeFileName}-${uniqueId}.zip`);
      fs.writeFileSync(tempFilePath, zipBuffer);
      
      // Configurar encabezados para la respuesta
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.zip"`);
      res.setHeader('Content-Length', fs.statSync(tempFilePath).size);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Enviar el archivo al cliente usando un stream
      const fileStream = fs.createReadStream(tempFilePath);
      fileStream.pipe(res);
      
      // Eliminar archivo temporal después de enviarlo
      fileStream.on('end', () => {
          fs.unlinkSync(tempFilePath);
      });
      
      fileStream.on('error', (err) => {
          console.error('Error durante el streaming del archivo:', err);
          if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
          }
      });
    } catch (error) {
        console.error("Error generating Angular project:", error);
        throw new BadRequestException("Failed to generate Angular project: " + error.message);
    }
  }
}
