
export interface IFormatNg {
  data: IDataNg;
}

export interface IDataNg {
  components: IComponentNg[];
  services: string[];
  router: IRouteNg[];
}

export interface IComponentNg {
  name: string;
  nameFile: string;
  ts: string;
  html: string;
}

export interface IRouteNg{
  path: string;
  component: string;
}