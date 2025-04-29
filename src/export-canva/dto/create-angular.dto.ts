import { IsObject, IsOptional, IsString } from "class-validator";
import { AngularOptions } from "./angular-option.dto";
import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from "nestjs-form-data";

export class CreateAngularDto {

  @IsString()
  projectId: string;

  @IsString()
  projectName: string;

  @IsObject()
  @IsOptional()
  canvasObjects?: Record<string, any>;

  @IsString()
  @IsOptional()
  canvasImage?: string;

  @IsObject()
  options: AngularOptions;
}


export class CreateExportAngularDto {

  @IsFile()
  @MaxFileSize(5 * 1024 * 1024)
  @HasMimeType(['image/*'])
  photo:     MemoryStoredFile;

}