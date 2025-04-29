import { IsBoolean, IsOptional, IsString } from "class-validator";

export class AngularOptions {
  @IsString()
  name: string;
  
  @IsString()
  version: string;
  
  @IsBoolean()
  @IsOptional()
  includeRouting: boolean;
  
  @IsBoolean()
  @IsOptional()
  responsiveLayout: boolean;
  
  @IsString()
  @IsOptional()
  cssFramework: string;
  
  @IsBoolean()
  @IsOptional()
  generateComponents: boolean;
}