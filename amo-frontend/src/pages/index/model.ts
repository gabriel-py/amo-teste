import type { Effect, Reducer } from 'umi';
import { getAirports, changeAirportStatus, getAirportsLogs } from './service';


export interface IAirports {
  id: number;
  key: number;
  iata: string;
  city: string;
  lat: number;
  lon: number;
  state: string;
  is_active: Boolean;
  inactive_reason: Boolean;
}

export interface IAirportsLogs {
  action: string;
  details: string;
  user: any;
  airport: any;
  action_time: Date;
}

export interface IAirportsState {
  airports: IAirports[];
  airportsLogs: IAirportsLogs[];
}

interface IAirportsModel {
  namespace: string;
  state: IAirportsState;
  effects: {
    init: Effect;
    fetchAirports: Effect;
    changeAirportStatus: Effect;
    fetchAirportLogs: Effect;
  };
  reducers: {
    update: Reducer<IAirportsState>;
  };
}
const AirportsModel: IAirportsModel = {
  namespace: 'airports',

  state: {
    airports: [],
    airportsLogs: []
  },

  effects: {
    *init(_, { put }) {
      yield put({ type: 'fetchAirports' });
    },

    *fetchAirports({ payload }, { call, put }) {
      const response = yield call(getAirports, payload);
      yield put({
        type: 'update',
        payload: {
          airports: response?.map((item: any, index: number) => {
            return {
              ...item,
              key: index,
            };
          }),
        },
      });
    },

    *changeAirportStatus({ payload }, { call, put }) {
      yield call(changeAirportStatus, payload);
    },

    *fetchAirportLogs({ payload }, { call, put }) {
      const response = yield call(getAirportsLogs, payload);
      yield put({
        type: 'update',
        payload: {
          airportsLogs: response?.map((item: any, index: number) => {
            return {
              ...item,
              key: index,
            };
          }),
        },
      });
    },
  },

  reducers: {
    update(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
export default AirportsModel;
