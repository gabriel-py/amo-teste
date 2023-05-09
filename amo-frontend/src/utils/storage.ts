import { HOUR, timestamp } from './time';

export function setItem(name: string, object: any, expires = HOUR): void {
  localStorage.setItem(
    name,
    JSON.stringify({
      object,
      expires: timestamp() + expires,
    }),
  );
}

export function getItem(name: string): any {
  const item = localStorage.getItem(name);
  if (!item) {
    return null;
  }

  const { expires, object } = JSON.parse(item);
  if (!expires || timestamp() > expires) {
    localStorage.removeItem(name);
    return null;
  }

  return object;
}

export function hasItem(name: string): boolean {
  return !!localStorage.getItem(name);
}

export function removeItem(name: string): void {
  localStorage.removeItem(name);
}


