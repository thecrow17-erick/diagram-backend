export interface IObjects {
  type: string;
  x: number;
  y: number;
  [key: string]: any;
}

export interface IResponseImport {
  objects: IObjects[];
}