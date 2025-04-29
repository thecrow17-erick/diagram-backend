import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface';
import { IResponseImport } from '../interface';
import { ImportsCanvaService } from '../services';
import { AddSketchDto } from '../dto';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';

@Controller('imports')
export class ImportsController {

  constructor(
    private importService: ImportsCanvaService
  ) {}



  @Post()
  @HttpCode(HttpStatus.OK)
  @FormDataRequest({storage: MemoryStoredFile})
  public async uploadSketch(
    @Body() addSketchDto: AddSketchDto
  ):Promise<IApiResponse<IResponseImport>> {
    const statusCode = HttpStatus.OK;

    const result = await this.importService.processSketch(addSketchDto.sketch.buffer);

    return {
      statusCode,
      message: "boceto transformado",
      data: {
        objects: result.objects
      }
    }
  
  }
}
