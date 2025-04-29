import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { promptIABoceto, promptIAComponentsAngular } from '../constants';
import {v4 as uuid} from "uuid"
import { IObjects } from '../interface';

@Injectable()
export class ImportsCanvaService {
  private readonly logger = new Logger(ImportsCanvaService.name)
  private openai: OpenAI

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


  public async processSketch(imageBuffer: Buffer): Promise<{objects: IObjects[]}> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      this.logger.log('Procesando boceto con OpenAI...');
      return await this.processWithOpenAI(base64Image);

    } catch (error) {
      this.logger.error(`Error al procesar con OpenAI: ${error.message}`);
      this.logger.warn('Usando elementos por defecto.');
      throw new BadRequestException("Ha ocurrido un error con su imagen, revise que sea unn boceto valido")          
    }
  }
  
  private async processWithOpenAI(base64Image: string): Promise<{objects: IObjects[]}> {
    try {
        if (!this.openai) {
            throw new Error('OpenAI no está inicializado. Verifica tu API key.');
        }
        
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: promptIABoceto
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

        const content = response.choices[0].message.content;
        
        // Extraer y parsear la respuesta JSON
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```([\s\S]*?)```/) || 
                         [null, content];
        
        let jsonString = jsonMatch[1] || content;
        
        // Limpiar el JSON si es necesario
        if(!jsonString.trim().startsWith('{')) {
            const startIndex = jsonString.indexOf('{');
            if (startIndex === -1) {
                throw new Error('No se pudo encontrar un objeto JSON válido en la respuesta de OpenAI');
            }
            jsonString = jsonString.substring(startIndex);
        }

        const parsedData = JSON.parse(jsonString);
        
        // Asegurarse de que hay un array de elementos
        let elements = [];
        if (Array.isArray(parsedData.elements)) {
            elements = parsedData.elements;
        } else if (Array.isArray(parsedData.shapes)) {
            elements = parsedData.shapes;
        } else if (Array.isArray(parsedData.objects)) {
            elements = parsedData.objects;
        } else if (parsedData.elements === undefined) {
            elements = this.transformToElementsArray(parsedData);
        }
        
        // Verificar si tenemos elementos
        if (elements.length === 0) {
            elements = [];
        }

        // Asegurarse de que todos los elementos tienen un objectId y coordenadas x,y
        elements = elements.map(elem => {
            if (!elem.objectId) {
                elem.objectId = uuid();
            }
            // Asegurarse de que cada elemento tiene coordenadas x, y
            if (elem.left !== undefined && elem.x === undefined) {
                elem.x = elem.left;
            }
            if (elem.top !== undefined && elem.y === undefined) {
                elem.y = elem.top;
            }
            return elem;
        });
        
        return { objects: elements };
    } catch (error) {
        this.logger.error(`Error al procesar el boceto con OpenAI: ${error.message}`);
        throw error;
    }
  }
  private transformToElementsArray(data: any): IObjects[] {
    const elements = [];
    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
            if (data[key].type) {
                elements.push(data[key]);
            }
        }
    }
    return elements;
    }

    public async generateAngularComponents(params: {
        imageBase64: string;
        options: string;
    }): Promise<any>{
        try {
            if (!this.openai) {
                throw new Error('OpenAI no está inicializado. Verifica tu API key.');
            }

            const {imageBase64, options} = params;
            
            if (!imageBase64) {
                throw new Error('Se requiere proporcionar una imagen (imageBase64)');
            }
            
            const prompt = promptIAComponentsAngular(imageBase64, options);

            return await this.generateComponentsWithOpenAI(prompt, imageBase64);
        } catch (error) {
            this.logger.error(`Error al generar componentes Angular:`, error);
            throw new Error(`Error al generar componentes Angular: ` + error.message);
        }
    }

    private async generateComponentsWithOpenAI(prompt: string, imageBase64: string): Promise<any> {

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: prompt 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 4000,
            temperature: 0.7
        });

        const content = response.choices[0].message.content;

        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || [null, content];

        let jsonString = jsonMatch[1] || content;

        if(!jsonString.trim().startsWith('{')) {
            jsonString = jsonString.substring(jsonString.indexOf('{'));
        }

        if(!jsonString.trim().endsWith('}')) {
            jsonString = jsonString.substring(0, jsonString.lastIndexOf('}') + 1);
        }

        return JSON.parse(jsonString);
    }
} 
