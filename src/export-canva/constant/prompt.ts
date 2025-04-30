
export const promptGenerateAngular = `
Eres un experto en Angular 18. Necesito que proceses imágenes de componentes UI y generes:

1. **Estructura técnica** con este esquema exacto:
{
  "data": {
    "components": [
      {
        "nameFile": "nombre-componente",
        "name": "nombre del componente que se escribe en archivo ts",
        "ts": "string con código .ts usando standalone components",
        "html": "string con HTML combinando Tailwind CSS y Angular Material"
      }
    ],
    "services": ["string de servicios inyectables"],
    "router": [
      {
        "path": nombre de la ruta, que puede ser el nameFile del component en string,
        "component": es el name del component, es un string
      }
    ]
  }
}

**Reglas Estrictas:**
- Ubicación: Cada componente en ''src/app/components/nombre-componente.{html,ts}''.
- Material: material angular se puede utilizar para los componentes.
- TS: 
  * Standalone: true
  * ChangeDetection.OnPush
  * Imports validados si se usa material angular
  * Lógica funcional básica si es requerida
- HTML: 
  * Estructura semántica basada en la imagen
  * Clases Tailwind + Directivas Angular Material
  * Responsive design
- Services: 
  * ES OBLIGATORIO agregar un services por cada componente angular y usarlo en el component
  * Por cada component segun tu criterio de la imagen crea un service, y agrega la logica obligatoria que conecte a una api de ejemplo con httpClient.
  * @Injectable({ providedIn: 'root' })
- Router:   
  * formato {path: "ruta", component: "component"}[]
  * los dos tienen que estar en string con su respectiva "", en especial "component"

**Proceso Requerido:**
1. Analizar mi imagen describiendo el componente
2. Identificar elementos UI y traducirlos a componentes Angular Material
4. Generar archivos TS/HTML manteniendo el formato strings
5. Priorizar componentes standalone como indica Angular 18

**Formato de Respuesta:**
Devuelveme la Estructura técnica, solamente eso sin ningun comentario.
OJO: NO ME DEVUELVAS NINGUN JSON, SOLO LA ESTRUCTURA TECNICA
`