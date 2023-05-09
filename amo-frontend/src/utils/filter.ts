import { FilterState } from '@/models/filter';
import dayjs from 'dayjs';

interface IPayload {
  regiao: string;
  uf: string;
  cidade: string;
  empreendimento: string;
  modulo: number;
}

interface IResultItem {
  id: number;
  regiao?: string;
  uf?: string;
  cidade?: string;
  empreendimento?: string;
  modulos?: number[];
}

interface IResult {
  regioes: IResultItem[];
  ufs: IResultItem[];
  cidades: IResultItem[];
  empreendimentos: IResultItem[];
}

export function parsePayload(payload: IPayload[]): IResult {
  const processed: {
    [k: string]: {
      [k: string]: boolean;
    };
  } = {};

  const result: IResult = {
    regioes: [],
    ufs: [],
    cidades: [],
    empreendimentos: [],
  };

  const map = {
    regioes: ['regiao'],
    ufs: ['uf', 'regiao'],
    cidades: ['cidade', 'regiao', 'uf'],
    empreendimentos: ['empreendimento', 'regiao', 'uf', 'cidade'],
  };
  const props = Object.keys(map);

  payload.forEach((item) => {
    for (let i = 0; i < props.length; i += 1) {
      if (!processed[props[i]]) {
        processed[props[i]] = {};
      }

      const key = item[map[props[i]][0]];
      if (!processed[props[i]][key]) {
        const object = {
          id: result[props[i]].length + 1,
        };

        map[props[i]].forEach((property: string) => {
          object[property] = item[property];
        });

        processed[props[i]][key] = true;
        result[props[i]].push(object);
      }
    }
  });

  for (let i = 0; i < result.empreendimentos.length; i += 1) {
    result.empreendimentos[i].modulos = payload
      .filter((item: IPayload) => item.empreendimento === result.empreendimentos[i].empreendimento)
      .map((item: IPayload) => item.modulo)
      .sort((a: IPayload['modulo'], b: IPayload['modulo']) => a - b);
  }

  return result;
}

export const generateKey = (props: FilterState['selected']): string => {
  return `${props.startDate?.format('YYMMDD')}${props.endDate?.format('YYMMDD')}${props.regiao}${
    props.uf
  }${props.cidade}${props.empreendimento}${props.modulo}`;
};

export const getPeriods = () => {
  const now = dayjs();
  return {
    custom: [now.subtract(1, 'year'), now],
    trimestre: [now.subtract(3, 'month'), now],
    semestre: [now.subtract(6, 'month'), now],
    ano: [now.startOf('year'), now],
  };
};
