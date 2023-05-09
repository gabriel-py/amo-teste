import { fetchAPI } from "@/utils/request";

export async function getAirports(): Promise<any> {
  const url = '/api/amo/airports/';

  return fetchAPI({
    method: 'GET',
    url,
    authorization: true,
  });
}

export async function changeAirportStatus(payload: any): Promise<any> {
  let url = `/api/amo/panel-airport/`;

  return fetchAPI({
    method: 'POST',
    url,
    body: payload,
    authorization: true,
  });
}

export async function getAirportsLogs(payload: any): Promise<any> {
  const url = `/api/amo/panel-airport/?iata=${payload?.iata}`;

  return fetchAPI({
    method: 'GET',
    url,
    authorization: true,
  });
}