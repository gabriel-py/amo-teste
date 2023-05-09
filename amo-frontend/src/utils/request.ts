import { notification } from 'antd';
import { getItem, setItem } from '@/utils/storage';

interface IFetchAPI {
  method: string;
  url: string;
  body?: any;
  authorization?: boolean;
  cacheLifetime?: number;
}


export async function fetchAPI(props: IFetchAPI): Promise<any> {
  const { method, url, body, authorization, cacheLifetime } = props;
  const apiUrl = 'http://localhost:8000'

  if (cacheLifetime) {
    const object = getItem(url);
    if (object) {
      return object;
    }
  }

  const headers: any = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  headers.Authorization = "Token 116472650922aaa19b99601851d1f1e048cd23f2";

  return fetch(apiUrl + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })
    .then((response: Response): Promise<ReadableStream> => response.json())
    .then((response: ReadableStream): any => {
      if (cacheLifetime) {
        setItem(url, response, cacheLifetime);
      }
      return response;
    })
    .catch(
      (error: any): Response => {
        notification.error({
          message: 'Request failed!',
          description: error.message,
        });
        return error.response;
      },
    );
}
