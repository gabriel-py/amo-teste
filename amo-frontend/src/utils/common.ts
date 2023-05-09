export function omit(obj: any, fields: string[]) {
  const shallowCopy = { ...obj };
  for (let i = 0; i < fields.length; i += 1) {
    delete shallowCopy[fields[i]];
  }
  return shallowCopy;
}

export function formatNumber(value: any, digits: number = 2): string {
  return value
    ? parseFloat(value.toString()).toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '0';
}

export function normalize(value: any): string {
  if (!value) {
    return '';
  }
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function numberFormat(value: any): string {
  return value ? parseInt(value, 10).toString() : '0';
}
