import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as JSZip from 'jszip';
import * as fse from 'fs-extra';


import {  CreateExportAngularDto } from '../dto';

import OpenAI from 'openai';``
import { ConfigService } from '@nestjs/config';
import { promptGenerateAngular } from '../constant';
import { IDataNg, IFormatNg, IRouteNg } from '../interface/format-ng.interface';



// const execAsync = promisify(exec);
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly templatePath = './plantilla-ng'
  private openai: OpenAI;

  constructor(
      private configService: ConfigService
  ){
    const apiKey = this.configService.get<string>('api_openai');
    try{
      this.openai = new OpenAI({
        apiKey
      })
      this.logger.log('Servicio de OpenAI inicializado correctamente'); 
    }catch (err){
      this.logger.error(`Error al inicializar OpenAI: ${err.message}`);
    }
  }
    

  public async generateAngularCode(createExportAngularDto: CreateExportAngularDto): Promise<Buffer> {
    try {
      const base64Image = createExportAngularDto.photo.buffer.toString('base64');
      const {data}: IFormatNg = await this.processWithOpenAI(base64Image);
      const dZip = await this.generateZip(data)
      return dZip;
    } catch (error) {
      throw new BadRequestException("Algo salio mal")
    }
  }

  async generateZip(data: IDataNg): Promise<Buffer> {
    const zip = new JSZip();
    // Añadir archivos de la plantilla
    await this.addTemplateFiles(zip);

    // Procesar componentes
    data.components.forEach(component => {
      const componentFolder = `src/app/components/${this.toKebabCase(component.nameFile)}`;
      zip.file(`${this.templatePath}/${componentFolder}/${component.nameFile}.component.ts`, component.ts);
      zip.file(`${this.templatePath}/${componentFolder}/${component.nameFile}.component.html`, component.html);
    });

    
    // Procesar servicios
    data.services.forEach(serviceContent => {
      const className = this.extractClassName(serviceContent);
      const servicePath = `${this.templatePath}/src/app/services/${this.toKebabCase(className.replace('Service', ''))}.service.ts`;
      zip.file(servicePath, serviceContent);
    });
    

    // Procesar rutas
    const routesContent = this.generateRoutesContent(data.router);
    zip.file(`${this.templatePath}/src/app/app.routes.ts`, routesContent);

    return zip.generateAsync({ type: 'nodebuffer' });
  }

  private async processWithOpenAI(base64Image: string): Promise<IFormatNg> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI no está inicializado. Verifica tu API key.');
      }
      this.logger.log("Ejecutando peticion a openai")
      const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
              {
                  role: "user",
                  content: [
                      { 
                          type: "text", 
                          text: promptGenerateAngular
                      },
                      {
                          type: "image_url",
                          image_url: {
                              url: `data:image/jpeg;base64,${base64Image}`,
                          },
                      },
                  ],
              },
          ],
          max_tokens: 4000,
      });

      this.logger.log("Operacion a openai ejecutado");
      const content = response.choices[0].message.content;
      const ngData = JSON.parse(content) as IFormatNg;
      return ngData;
    }
    catch(err){
      throw new BadRequestException(err)
    }
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  private async addTemplateFiles(zip: JSZip): Promise<void> {
    const files = await fse.readdir(this.templatePath, { recursive: true, withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) continue;

      const relativePath = path.join(file.parentPath, file.name).replace(/\\/g, '/');
      const content = await fse.readFile(path.join('./', relativePath));
      zip.file(relativePath, content);
    }
  }

  private extractClassName(content: string): string {
    const match = content.match(/export class (\w+)/);
    return match ? match[1] : 'GeneratedService';
  }

  private generateRoutesContent(router: IRouteNg[]): string {
    try {
      const imports = router
        .map(entry => entry.component)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map(component => {
          const kebabName = this.toKebabCase(component.replace('Component', ''));
          return `import { ${component} } from './components/${kebabName}/${kebabName}.component';`;
        })
        .join('\n');
      const routes = router
        .map(entry => `  { path: '${entry.path}', component: ${entry.component} }`)
        .join(',\n');
      
      const routerRes = `import { Routes } from '@angular/router';\n\n${imports}\n\nexport const routes: Routes = [\n${routes}\n];`;
      
      return routerRes;
      
    } catch (err) {
      throw new BadRequestException(err)
    }
  }
}
