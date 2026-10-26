import { IParseData } from '../interfaces';

export function parsData(data: IParseData[]): IParseData[] {
  return data.slice(0, 15);
}
