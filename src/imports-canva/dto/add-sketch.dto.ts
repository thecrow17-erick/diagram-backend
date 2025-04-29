import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from "nestjs-form-data";



export class AddSketchDto {


  @IsFile()
  @MaxFileSize(5 * 1024 * 1024)
  @HasMimeType(['image/*'])
  sketch:     MemoryStoredFile;

}