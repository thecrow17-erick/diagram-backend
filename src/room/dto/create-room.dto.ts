import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from "nestjs-form-data";

export class CreateRoomDto {
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  name: string;


  @IsString()
  @MinLength(10)
  @MaxLength(255)
  description: string


  @IsFile()
  @IsOptional()
  @MaxFileSize(5 * 1024 * 1024)
  @HasMimeType(['image/*'])
  sketch?:     MemoryStoredFile;
}